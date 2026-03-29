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
  selectShuffle,
  selectRepeat,
  selectQueueIsLoading,
  selectQueueError,
  selectHasNext,
  selectHasPrev,
} from "../store/queueSlice";
import type { buildQueueParams, useQueueReturn } from "@/features/player-core/types";

/**
 * useQueue — Queue system for the playback engine.
 *
 * Wraps the Redux queue slice and exposes:
 *  - loadQueue   → fetch queue from backend and populate Redux
 *  - next/prev   → navigate tracks (respects repeat mode)
 *  - jumpTo      → jump to a specific index
 *  - addTrack    → add a track at end or specific position
 *  - removeTrack → remove a track by trackId
 *  - toggleShuffle / toggleRepeat
 *  - clearQueue
 *
 * Usage:
 *   const queue = useQueue();
 *   await queue.loadQueue({ contextType: "album", contextId: "abc-123" });
 *   queue.next();
 *   // pass queue.currentTrackId to usePlayback
 */
export function useQueue(): useQueueReturn {
  const dispatch = useDispatch();

  const tracks         = useSelector(selectQueueTracks);
  const currentIndex   = useSelector(selectCurrentIndex);
  const currentTrackId = useSelector(selectCurrentTrackId);
  const shuffle        = useSelector(selectShuffle);
  const repeat         = useSelector(selectRepeat);
  const isLoading      = useSelector(selectQueueIsLoading);
  const error          = useSelector(selectQueueError);
  const hasNext        = useSelector(selectHasNext);
  const hasPrev        = useSelector(selectHasPrev);

  const loadQueue = useCallback(
    async (params: buildQueueParams) => {
      dispatch(setQueueLoading());
      try {
        const response = await playbackService.buildQueue(params);
        dispatch(
          setQueue({
            tracks:       response.queue,
            currentIndex: response.currentIndex,
            shuffle:      response.shuffle,
            repeat:       response.repeat,
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

  const next = useCallback(() => {
    dispatch(nextTrack());
  }, [dispatch]);

  const prev = useCallback(() => {
    dispatch(prevTrack());
  }, [dispatch]);

  const jumpTo = useCallback(
    (index: number) => {
      dispatch(jumpToIndex(index));
    },
    [dispatch]
  );

  const handleAddTrack = useCallback(
    (trackId: string, atIndex?: number) => {
      dispatch(addTrack({ trackId, atIndex }));
    },
    [dispatch]
  );

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      dispatch(removeTrack(trackId));
    },
    [dispatch]
  );

  const handleToggleShuffle = useCallback(() => {
    dispatch(toggleShuffle());
  }, [dispatch]);

  const handleToggleRepeat = useCallback(() => {
    dispatch(toggleRepeat());
  }, [dispatch]);

  const handleClearQueue = useCallback(() => {
    dispatch(clearQueue());
  }, [dispatch]);

  return {
    tracks,
    currentIndex,
    currentTrackId,
    shuffle,
    repeat,
    isLoading,
    error,
    hasNext,
    hasPrev,
    loadQueue,
    next,
    prev,
    addTrack:      handleAddTrack,
    removeTrack:   handleRemoveTrack,
    jumpTo,
    toggleShuffle: handleToggleShuffle,
    toggleRepeat:  handleToggleRepeat,
    clearQueue:    handleClearQueue,
  };
}