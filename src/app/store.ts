import { configureStore } from "@reduxjs/toolkit";
import audioSourceReducer from "../store/AudioSourceSlice";
import userReducer from "../store/userSlice";
import queueReducer from "@/store/queueSlice"; // adjust path as needed
import playContextReducer from "@/store/playContextSlice";



export const store = configureStore({
  reducer: {
    audioSource: audioSourceReducer,
    user: userReducer,
    queue:queueReducer,
    playContext: playContextReducer,


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;