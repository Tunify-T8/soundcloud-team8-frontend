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
}: usePlaybackOptions): usePlaybackReturn {
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const streamExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackIdRef      = useRef(trackId);

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  const [bundle,      setBundle]      = useState<playbackBundle | null>(null);
  const [status,      setStatus]      = useState<playerStatus>("idle");
  const [error,       setError]       = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume,      setVolumeState] = useState(1);
  const [isMuted,     setIsMuted]     = useState(false);
  const [buffered,    setBuffered]    = useState(0);

  const access = usePlaybackAccessibility(bundle);

  const duration = bundle?.durationSeconds ?? 0;

  const previewSecondsRemaining =
    access.isPreview
      ? Math.max(0, access.previewDurationSeconds - currentTime)
      : null;

  // ── Stream refresh (uses ref to avoid self-reference lint error) ──────────
  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>();

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
        audio.src = fresh.stream.url;
        audio.load();
        audio.addEventListener(
          "canplay",
          () => {
            audio.currentTime = resumeTime;
            if (wasPlaying) audio.play().catch(() => {});
          },
          { once: true }
        );
        scheduleRefreshRef.current?.(fresh.stream.expiresInSeconds);
      } catch {
        // Non-fatal — stream may still work until actual expiry
      }
    }, refreshIn);
  };

  // ── Attach MP3 stream ─────────────────────────────────────────────────────
  const attachStream = useCallback(
    (streamUrl: string, expiresInSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = streamUrl;
      audio.load();
      scheduleRefreshRef.current?.(expiresInSeconds);
    },
    []
  );

  // ── Load track ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!trackId) {
      setStatus("idle");
      setBundle(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);
    setCurrentTime(0);

    const load = async () => {
      try {
        // Step 1: fetch playback bundle
        const b = await playbackService.getPlaybackBundle(trackId, privateToken);
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
            { once: true }
          );
        }

        setStatus("ready");
        if (autoPlay) audioRef.current?.play().catch(() => {});
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
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [trackId, privateToken, autoPlay, attachStream]);

  // ── Audio event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (duration > 0 && audio.currentTime >= duration) {
        audio.pause();
        audio.currentTime = duration;
        setStatus("paused");
        if (trackId) {
          playbackService.reportCompleted(trackId);
        }
        return;
      }

      // Enforce preview time limit
      if (
        access.isPreview &&
        access.previewDurationSeconds > 0 &&
        audio.currentTime >= access.previewStartSeconds + access.previewDurationSeconds
      ) {
        audio.pause();
        audio.currentTime = access.previewStartSeconds;
        setStatus("paused");
      }

      // Update buffered progress
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1) / (duration || 1));
      }
    };

    const onPlay  = () => setStatus("playing");
    const onPause = () => setStatus("paused");

    const onEnded = () => {
      setStatus("paused");
      if (trackId) {
        playbackService.reportCompleted(trackId);
      }
    };

    const onError = () => {
      setStatus("error");
      setError("Audio playback error.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play",       onPlay);
    audio.addEventListener("pause",      onPause);
    audio.addEventListener("ended",      onEnded);
    audio.addEventListener("error",      onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play",       onPlay);
      audio.removeEventListener("pause",      onPause);
      audio.removeEventListener("ended",      onEnded);
      audio.removeEventListener("error",      onError);
    };
  }, [trackId, access, duration]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      let target = seconds;
      if (access.isPreview) {
        target = Math.min(
          Math.max(seconds, access.previewStartSeconds),
          access.previewStartSeconds + access.previewDurationSeconds - 1
        );
      }

      audio.currentTime = target;
    },
    [access]
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
    previewSecondsRemaining,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    audioRef,
  };
}