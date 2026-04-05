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
  selectTotalCount,
  selectCurrentTrack,
} from "@/store/queueSlice";
import type { buildQueueParams, queueTrack, useQueueReturn } from "@/features/player-core/types";

export function useQueue(): useQueueReturn {
  const dispatch = useDispatch();

  const tracks         = useSelector(selectQueueTracks);
  const currentIndex   = useSelector(selectCurrentIndex);
  const currentTrackId = useSelector(selectCurrentTrackId);
  const currentTrack   = useSelector(selectCurrentTrack);
  const shuffle        = useSelector(selectShuffle);
  const repeat         = useSelector(selectRepeat);
  const isLoading      = useSelector(selectQueueIsLoading);
  const error          = useSelector(selectQueueError);
  const hasNext        = useSelector(selectHasNext);
  const hasPrev        = useSelector(selectHasPrev);
  const totalCount     = useSelector(selectTotalCount);

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
            totalCount:   response.totalCount,
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

  const next           = useCallback(() => dispatch(nextTrack()),          [dispatch]);
  const prev           = useCallback(() => dispatch(prevTrack()),          [dispatch]);
  const jumpTo         = useCallback((i: number) => dispatch(jumpToIndex(i)), [dispatch]);
  const handleAdd      = useCallback((track: queueTrack, atIndex?: number) => dispatch(addTrack({ track, atIndex })), [dispatch]);
  const handleRemove   = useCallback((trackId: string) => dispatch(removeTrack(trackId)), [dispatch]);
  const handleShuffle  = useCallback(() => dispatch(toggleShuffle()),      [dispatch]);
  const handleRepeat   = useCallback(() => dispatch(toggleRepeat()),       [dispatch]);
  const handleClear    = useCallback(() => dispatch(clearQueue()),         [dispatch]);

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
    loadQueue,
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