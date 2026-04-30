import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { playbackService } from "@/features/player-core/Playbackservice";
import {
  setQueueLoading,
  setQueueError,
  setQueue,
  nextTrack,
  prevTrack,
  jumpToIndex,
  addTrack,
  removeTrack,
  toggleShuffle,
  toggleRepeat,
  clearQueue,
  selectQueueTracks,
  selectCurrentIndex,
  selectCurrentTrackId,
  selectCurrentTrack,
  selectActiveContext,
  selectShuffle,
  selectRepeat,
  selectQueueIsLoading,
  selectQueueError,
  selectHasNext,
  selectHasPrev,
  selectTotalCount,
} from "@/store/queueSlice";
import { selectPlayContext } from "@/store/playContextSlice";
import type {
  buildQueueParams,
  queueTrack,
  useQueueReturn,
} from "@/features/player-core/types";

export function useQueue(): useQueueReturn {
  const dispatch = useDispatch();

  const tracks         = useSelector(selectQueueTracks);
  const currentIndex   = useSelector(selectCurrentIndex);
  const currentTrackId = useSelector(selectCurrentTrackId);
  const currentTrack   = useSelector(selectCurrentTrack);
  const activeContext  = useSelector(selectActiveContext);
  const shuffle        = useSelector(selectShuffle);
  const repeat         = useSelector(selectRepeat);
  const isLoading      = useSelector(selectQueueIsLoading);
  const error          = useSelector(selectQueueError);
  const hasNext        = useSelector(selectHasNext);
  const hasPrev        = useSelector(selectHasPrev);
  const totalCount     = useSelector(selectTotalCount);

  // The page-level context (set by whichever page the user is on)
  const playContext    = useSelector(selectPlayContext);

  // ── loadQueue: explicit, pass params directly ─────────────────────────────
  const loadQueue = useCallback(
    async (params: buildQueueParams) => {
      dispatch(setQueueLoading());
      try {
        const response = await playbackService.buildQueue(params);
        dispatch(
          setQueue({
            tracks:        response.queue,
            currentIndex:  response.currentIndex,
            shuffle:       response.shuffle,
            repeat:        response.repeat,
            totalCount:    response.totalCount,
            activeContext: {
              contextType: params.contextType,
              contextId:   params.contextId,
            },
          })
        );
      } catch (err: unknown) {
        dispatch(
          setQueueError(
            err instanceof Error ? err.message : "Failed to load queue."
          )
        );
      }
    },
    [dispatch]
  );

  // ── playTrack: smart — reads the active page context automatically ────────
  /**
   * Call this when the user clicks play on any track anywhere in the app.
   *
   * It reads the context that was registered by the current page via
   * `usePlayContext`, then calls `POST /tracks/playback-context` with that
   * context and `startTrackId` set to the clicked track.
   *
   * The backend returns a full ordered queue starting from that track,
   * respecting the context's ordering rules (playlist order, feed order, etc).
   *
   * Falls back to a single-track queue if no context has been registered yet.
   */
  const playTrack = useCallback(
    async (trackId: string) => {
      if (!playContext) {
        // No page context registered — build a minimal single-track queue
        // so playback always works even without a context.
        console.warn(
          "[useQueue] playTrack called with no active play context. " +
          "Make sure the current page calls usePlayContext()."
        );
        dispatch(setQueueLoading());
        try {
          const response = await playbackService.buildQueue({
            contextType:  "feed",   // safest fallback — backend resolves from auth
            contextId:    "me",
            startTrackId: trackId,
            shuffle:      false,
            repeat:       "none",
          });
          dispatch(
            setQueue({
              tracks:        response.queue,
              currentIndex:  response.currentIndex,
              shuffle:       response.shuffle,
              repeat:        response.repeat,
              totalCount:    response.totalCount,
              activeContext: { contextType: "feed", contextId: "me" },
            })
          );
        } catch (err: unknown) {
          dispatch(
            setQueueError(
              err instanceof Error ? err.message : "Failed to load queue."
            )
          );
        }
        return;
      }

      // Normal path — use whatever context the page registered
      await loadQueue({
        contextType:  playContext.contextType,
        contextId:    playContext.contextId,
        startTrackId: trackId,
        shuffle:      playContext.shuffle,
        repeat:       playContext.repeat,
      });
    },
    [dispatch, playContext, loadQueue]
  );

  const next          = useCallback(() => dispatch(nextTrack()),               [dispatch]);
  const prev          = useCallback(() => dispatch(prevTrack()),               [dispatch]);
  const jumpTo        = useCallback((i: number) => dispatch(jumpToIndex(i)),   [dispatch]);
  const handleAdd     = useCallback(
    (track: queueTrack, atIndex?: number) => dispatch(addTrack({ track, atIndex })),
    [dispatch]
  );
  const handleRemove  = useCallback((id: string) => dispatch(removeTrack(id)), [dispatch]);
  const handleShuffle = useCallback(() => dispatch(toggleShuffle()),           [dispatch]);
  const handleRepeat  = useCallback(() => dispatch(toggleRepeat()),            [dispatch]);
  const handleClear   = useCallback(() => dispatch(clearQueue()),              [dispatch]);

  return {
    tracks,
    currentIndex,
    currentTrackId,
    currentTrack,
    shuffle,
    repeat,
    isLoading,
    error,
    hasNext,
    hasPrev,
    totalCount,
    activeContext,
    loadQueue,
    playTrack,
    next,
    prev,
    addTrack:      handleAdd,
    removeTrack:   handleRemove,
    jumpTo,
    toggleShuffle: handleShuffle,
    toggleRepeat:  handleRepeat,
    clearQueue:    handleClear,
  };
}