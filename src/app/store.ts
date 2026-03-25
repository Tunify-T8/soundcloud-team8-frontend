import { configureStore } from "@reduxjs/toolkit";
import audioSourceReducer from "../store/AudioSourceSlice";
import userReducer from "../store/userSlice";

export const store = configureStore({
  reducer: {
    audioSource: audioSourceReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;