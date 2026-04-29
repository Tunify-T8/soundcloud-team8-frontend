import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { contextType, repeatMode } from "@/features/player-core/types";

/**
 * PlayContext describes WHERE the user is playing from.
 * Pages set this when they mount (or when the user clicks play).
 * The queue system reads it to know which context to send to the backend.
 */
export interface PlayContext {
  contextType: contextType;
  /**
   * The ID of the context resource:
   *  - playlist  → playlist UUID
   *  - profile   → user UUID
   *  - history   → the authed user's own ID (or a fixed sentinel like "me")
   *  - feed      → a fixed sentinel like "me" (backend resolves from auth)
   */
  contextId: string;
  shuffle: boolean;
  repeat: repeatMode;
}

interface PlayContextState {
  active: PlayContext | null;
}

const initialState: PlayContextState = {
  active: null,
};

const playContextSlice = createSlice({
  name: "playContext",
  initialState,
  reducers: {
    /**
     * Called by pages (Feed, Profile, Playlist, History) when they mount
     * or when the user triggers playback from that page.
     */
    setPlayContext(state, action: PayloadAction<PlayContext>) {
      state.active = action.payload;
    },

    /**
     * Optionally reset when navigating away entirely.
     * In most cases you don't need this — the next page will overwrite it.
     */
    clearPlayContext(state) {
      state.active = null;
    },
  },
});

export const { setPlayContext, clearPlayContext } = playContextSlice.actions;
export default playContextSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectPlayContext = (state: { playContext: PlayContextState }) =>
  state.playContext.active;