import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
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
  const hlsRef          = useRef<Hls | null>(null);
  const streamExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Cleanup HLS ───────────────────────────────────────────────────────────
  const destroyHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
  }, []);

  // ── Attach HLS stream ─────────────────────────────────────────────────────
  const attachStream = useCallback(
    (streamUrl: string, expiresInSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      destroyHls();

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, (_evt: unknown, data: { fatal: boolean }) => {
          if (data.fatal) {
            setStatus("error");
            setError("Stream error. Please try again.");
          }
        });
        hlsRef.current = hls;
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        audio.src = streamUrl;
      } else {
        setStatus("error");
        setError("Your browser does not support audio streaming.");
        return;
      }

      // Refresh stream URL 30s before expiry
      const refreshIn = Math.max((expiresInSeconds - 30) * 1000, 5000);
      streamExpiryRef.current = setTimeout(async () => {
        if (!trackId) return;
        try {
          const fresh = await playbackService.requestStreamUrl(trackId);
          attachStream(fresh.stream.url, fresh.stream.expiresInSeconds);
        } catch {
          // Non-fatal — stream may still work until actual expiry
        }
      }, refreshIn);
    },
    [trackId, destroyHls]
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

        // Step 3: request signed stream URL (playable + preview both get one)
        const streamData = await playbackService.requestStreamUrl(trackId);
        if (cancelled) return;

        attachStream(streamData.stream.url, streamData.stream.expiresInSeconds);

        // Step 4: if preview, seek to previewStartSeconds on load
        if (b.playability.status === "preview" && b.preview.enabled) {
          const audio = audioRef.current;
          if (audio) audio.currentTime = b.preview.previewStartSeconds;
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
      destroyHls();
      if (streamExpiryRef.current) clearTimeout(streamExpiryRef.current);
    };
  }, [trackId, privateToken, autoPlay, attachStream, destroyHls]);

  // ── Audio event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Enforce preview time limit — stop at previewStartSeconds + previewDurationSeconds
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

    const onPlay = () => {
      setStatus("playing");
    };

    const onPause = () => {
      setStatus("paused");
    };

    // Only called on natural completion — report to backend
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

      // Clamp seek within preview bounds
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