import { useState, useEffect, useRef, useCallback } from "react";
import type {
  playbackBundle,
  playerStatus,
  usePlaybackOptions,
  usePlaybackReturn,
} from "@/features/player-core/types";
import { playbackService } from "@/features/player-core/Playbackservice";
import { usePlaybackAccessibility } from "./Useplaybackaccessibility";

export function usePlayback({
  trackId,
  privateToken,
  autoPlay = false,
  offlineSrc,
}: usePlaybackOptions): usePlaybackReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackIdRef = useRef(trackId);
  const autoPlayRef = useRef(autoPlay);
  const suppressPauseStatusRef = useRef(false);

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const [bundle, setBundle] = useState<playbackBundle | null>(null);
  const [status, setStatus] = useState<playerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [endedCount, setEndedCount] = useState(0);
  const endHandledRef = useRef(false);

  const access = usePlaybackAccessibility(bundle);

  const duration = offlineSrc ? mediaDuration : (bundle?.durationSeconds ?? 0);

  const previewSecondsRemaining = access.isPreview
    ? Math.max(0, access.previewDurationSeconds - currentTime)
    : null;

  // ── Stream refresh (uses ref to avoid self-reference lint error) ──────────
  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>(
    () => {},
  );

  useEffect(() => {
    scheduleRefreshRef.current = (expiresInSeconds: number) => {
      if (streamExpiryRef.current) clearTimeout(streamExpiryRef.current);
      const refreshIn = Math.max((expiresInSeconds - 30) * 1000, 5000);
      streamExpiryRef.current = setTimeout(async () => {
        const currentTrackId = trackIdRef.current;
        if (!currentTrackId) return;
        const audio = audioRef.current;
        if (!audio) return;
        try {
          const fresh = await playbackService.requestStreamUrl(currentTrackId);
          const wasPlaying = !audio.paused;
          const resumeTime = audio.currentTime;
          suppressPauseStatusRef.current = true;
          audio.src = fresh.stream.url;
          audio.load();
          audio.addEventListener(
            "canplay",
            () => {
              audio.currentTime = resumeTime;
              if (wasPlaying) audio.play().catch(() => {});
            },
            { once: true },
          );
          scheduleRefreshRef.current?.(fresh.stream.expiresInSeconds);
        } catch {
          // Non-fatal — stream may still work until actual expiry
        }
      }, refreshIn);
    };
  }, []);

  // ── Attach MP3 stream ─────────────────────────────────────────────────────
  const attachStream = useCallback(
    (streamUrl: string, expiresInSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.autoplay = autoPlayRef.current;
      audio.addEventListener(
        "canplay",
        () => {
          if (!autoPlayRef.current) return;
          audio.play().catch(() => {});
        },
        { once: true },
      );
      suppressPauseStatusRef.current = true;
      audio.src = streamUrl;
      audio.load();
      scheduleRefreshRef.current?.(expiresInSeconds);
    },
    [],
  );

  // ── Load track ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!trackId) {
      if (status !== "idle") setStatus("idle");
      if (bundle !== null) setBundle(null);
      return;
    }

    let cancelled = false;
    endHandledRef.current = false;
    setStatus("loading");
    setError(null);
    setCurrentTime(0);
    setMediaDuration(0);

    const load = async () => {
      try {
        if (offlineSrc) {
          const audio = audioRef.current;
          if (!audio) return;
          audio.autoplay = autoPlayRef.current;
          audio.addEventListener(
            "canplay",
            () => {
              if (!autoPlayRef.current) return;
              audio.play().catch(() => {});
            },
            { once: true },
          );
          suppressPauseStatusRef.current = true;
          audio.src = offlineSrc;
          audio.load();
          setBundle(null);
          setBuffered(0);
          setStatus("ready");
          return;
        }

        // Step 1: fetch playback bundle
        const b = await playbackService.getPlaybackBundle(
          trackId,
          privateToken,
        );
        if (cancelled) return;
        setBundle(b);

        // Step 2: blocked → stop here, no stream needed
        if (b.playability.status === "blocked") {
          setStatus("blocked");
          return;
        }

        // Step 3: request signed stream URL
        const streamData = await playbackService.requestStreamUrl(trackId);
        if (cancelled) return;

        attachStream(streamData.stream.url, streamData.stream.expiresInSeconds);

        // Step 4: if preview, seek to previewStartSeconds once audio is ready
        if (b.playability.status === "preview" && b.preview.enabled) {
          audioRef.current?.addEventListener(
            "canplay",
            () => {
              if (audioRef.current) {
                audioRef.current.currentTime = b.preview.previewStartSeconds;
              }
            },
            { once: true },
          );
        }

        setStatus("ready");
        if (autoPlayRef.current) audioRef.current?.play().catch(() => {});
      } catch (err: unknown) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load track.");
        setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
      if (streamExpiryRef.current) clearTimeout(streamExpiryRef.current);
      if (audioRef.current) {
        audioRef.current.autoplay = false;
        suppressPauseStatusRef.current = true;
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [trackId, privateToken, attachStream, offlineSrc]);

  // ── Audio event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const finishPlayback = () => {
      if (endHandledRef.current) return;
      endHandledRef.current = true;
      audio.pause();
      if (duration > 0) {
        audio.currentTime = duration;
        setCurrentTime(duration);
      }
      setStatus("paused");
      setEndedCount((prev) => prev + 1);
      if (trackId) {
        playbackService.reportCompleted(trackId);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (duration > 0 && audio.currentTime >= duration) {
        finishPlayback();
        return;
      }

      // Enforce preview time limit
      if (
        access.isPreview &&
        access.previewDurationSeconds > 0 &&
        audio.currentTime >=
          access.previewStartSeconds + access.previewDurationSeconds
      ) {
        audio.pause();
        audio.currentTime = access.previewStartSeconds;
        setStatus("paused");
      }

      // Update buffered progress
      if (audio.buffered.length > 0) {
        setBuffered(
          audio.buffered.end(audio.buffered.length - 1) / (duration || 1),
        );
      }
    };

    const onLoadedMetadata = () => {
      setMediaDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onPlay = () => {
      suppressPauseStatusRef.current = false;
      if (duration <= 0 || audio.currentTime < duration) {
        endHandledRef.current = false;
      }
      setStatus("playing");
    };
    const onPause = () => {
      if (suppressPauseStatusRef.current) {
        suppressPauseStatusRef.current = false;
        return;
      }
      setStatus("paused");
    };

    const onEnded = () => finishPlayback();

    const onError = () => {
      setStatus("error");
      setError("Audio playback error.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [trackId, access, duration]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (!audioRef.current) return;
    autoPlayRef.current = true;
    audioRef.current.autoplay = true;
    suppressPauseStatusRef.current = false;
    audioRef.current.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    autoPlayRef.current = false;
    audioRef.current.autoplay = false;
    suppressPauseStatusRef.current = false;
    audioRef.current.pause();
  }, []);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      let target = seconds;
      if (access.isPreview) {
        target = Math.min(
          Math.max(seconds, access.previewStartSeconds),
          access.previewStartSeconds + access.previewDurationSeconds - 1,
        );
      }

      endHandledRef.current = false;
      audio.currentTime = target;
    },
    [access],
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  return {
    status,
    bundle,
    error,
    currentTime,
    duration,
    volume,
    isMuted,
    buffered,
    endedCount,
    previewSecondsRemaining,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    audioRef,
  };
}
