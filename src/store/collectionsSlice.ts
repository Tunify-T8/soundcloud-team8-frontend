import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CollectionPreview } from "@/features/library/types";

interface CollectionsState {
  myPlaylists: CollectionPreview[];
  myAlbums: CollectionPreview[];
}

const initialState: CollectionsState = {
  myPlaylists: [],
  myAlbums: [],
};

const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    setMyPlaylists(state, action: PayloadAction<CollectionPreview[]>) {
      state.myPlaylists = action.payload;
    },
    addPlaylist(state, action: PayloadAction<CollectionPreview>) {
      state.myPlaylists.unshift(action.payload);
    },
    removePlaylist(state, action: PayloadAction<string>) {
      state.myPlaylists = state.myPlaylists.filter((p) => p.id !== action.payload);
    },
    updatePlaylistInList(state, action: PayloadAction<Partial<CollectionPreview> & { id: string }>) {
      const idx = state.myPlaylists.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.myPlaylists[idx] = { ...state.myPlaylists[idx], ...action.payload };
      }
    },
  },
});

export const { setMyPlaylists, addPlaylist, removePlaylist, updatePlaylistInList } =
  collectionsSlice.actions;
export default collectionsSlice.reducer;