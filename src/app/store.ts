import { configureStore } from "@reduxjs/toolkit";
import audioSourceReducer from "../store/AudioSourceSlice";

export const store = configureStore({
  reducer: {
    audioSource: audioSourceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;