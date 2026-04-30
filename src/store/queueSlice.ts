import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  queueState,
  queueTrack,
  repeatMode,
  activeQueueContext,
} from "@/features/player-core/types";

const repeatCycle: repeatMode[] = ["none", "all", "one"];

const initialState: queueState = {
  tracks:        [],
  currentIndex:  0,
  shuffle:       false,
  repeat:        "none",
  isLoading:     false,
  error:         null,
  totalCount:    0,
  activeContext: null,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setQueueLoading(state) {
      state.isLoading = true;
      state.error     = null;
    },

    setQueueError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error     = action.payload;
    },

    setQueue(
      state,
      action: PayloadAction<{
        tracks:        queueTrack[];
        currentIndex:  number;
        shuffle:       boolean;
        repeat:        repeatMode;
        totalCount:    number;
        activeContext: activeQueueContext;
      }>
    ) {
      state.tracks        = action.payload.tracks;
      state.currentIndex  = action.payload.currentIndex;
      state.shuffle       = action.payload.shuffle;
      state.repeat        = action.payload.repeat;
      state.totalCount    = action.payload.totalCount;
      state.activeContext = action.payload.activeContext;
      state.isLoading     = false;
      state.error         = null;
    },

    nextTrack(state) {
      const { tracks, currentIndex, repeat } = state;
      if (!tracks.length) return;

      const isLast = currentIndex === tracks.length - 1;
      if (repeat === "one") return;
      if (isLast) {
        if (repeat === "all") state.currentIndex = 0;
        return;
      }
      state.currentIndex = currentIndex + 1;
    },

    prevTrack(state) {
      const { tracks, currentIndex, repeat } = state;
      if (!tracks.length) return;

      const isFirst = currentIndex === 0;
      if (repeat === "one") return;
      if (isFirst) {
        if (repeat === "all") state.currentIndex = tracks.length - 1;
        return;
      }
      state.currentIndex = currentIndex - 1;
    },

    jumpToIndex(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (index >= 0 && index < state.tracks.length) {
        state.currentIndex = index;
      }
    },

    addTrack(
      state,
      action: PayloadAction<{ track: queueTrack; atIndex?: number }>
    ) {
      const { track, atIndex } = action.payload;
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= state.tracks.length) {
        state.tracks.splice(atIndex, 0, track);
        if (atIndex <= state.currentIndex) state.currentIndex += 1;
      } else {
        state.tracks.push(track);
      }
      state.totalCount = state.tracks.length;
    },

    removeTrack(state, action: PayloadAction<string>) {
      const index = state.tracks.findIndex((t) => t.trackId === action.payload);
      if (index === -1) return;

      state.tracks.splice(index, 1);
      state.totalCount = state.tracks.length;

      if (index < state.currentIndex) {
        state.currentIndex -= 1;
      } else if (index === state.currentIndex) {
        state.currentIndex = Math.min(state.currentIndex, state.tracks.length - 1);
      }
    },

    toggleShuffle(state) {
      state.shuffle = !state.shuffle;
    },

    toggleRepeat(state) {
      const currentIdx = repeatCycle.indexOf(state.repeat);
      state.repeat = repeatCycle[(currentIdx + 1) % repeatCycle.length];
    },

    clearQueue(state) {
      state.tracks        = [];
      state.currentIndex  = 0;
      state.shuffle       = false;
      state.repeat        = "none";
      state.isLoading     = false;
      state.error         = null;
      state.totalCount    = 0;
      state.activeContext = null;
    },
  },
});

export const {
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
} = queueSlice.actions;

export default queueSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectQueueTracks    = (state: { queue: queueState }) => state.queue.tracks;
export const selectCurrentIndex   = (state: { queue: queueState }) => state.queue.currentIndex;
export const selectActiveContext  = (state: { queue: queueState }) => state.queue.activeContext;
export const selectCurrentTrackId = (state: { queue: queueState }) =>
  state.queue.tracks[state.queue.currentIndex]?.trackId ?? null;
export const selectCurrentTrack   = (state: { queue: queueState }) =>
  state.queue.tracks[state.queue.currentIndex] ?? null;
export const selectShuffle        = (state: { queue: queueState }) => state.queue.shuffle;
export const selectRepeat         = (state: { queue: queueState }) => state.queue.repeat;
export const selectQueueIsLoading = (state: { queue: queueState }) => state.queue.isLoading;
export const selectQueueError     = (state: { queue: queueState }) => state.queue.error;
export const selectTotalCount     = (state: { queue: queueState }) => state.queue.totalCount;
export const selectHasNext        = (state: { queue: queueState }) => {
  const { tracks, currentIndex, repeat } = state.queue;
  return repeat === "all" || repeat === "one" || currentIndex < tracks.length - 1;
};
export const selectHasPrev        = (state: { queue: queueState }) => {
  const { currentIndex, repeat } = state.queue;
  return repeat === "all" || repeat === "one" || currentIndex > 0;
};