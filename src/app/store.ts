import { configureStore } from "@reduxjs/toolkit";
import audioSourceReducer from "../store/AudioSourceSlice";
import userReducer from "../store/userSlice";
import queueReducer from "@/store/queueSlice";
import collectionsReducer from "../store/collectionsSlice";
export const store = configureStore({
  reducer: {
    audioSource: audioSourceReducer,
    user: userReducer,
    queue: queueReducer,
    collections: collectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;