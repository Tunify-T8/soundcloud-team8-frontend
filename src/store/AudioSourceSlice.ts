import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// We store serializable data only — no Blobs, no Files.
// The caller creates an object URL before dispatching.
export type AudioSource =
  | {
      kind: "file"
      url: string       // object URL — revoke when done
      name: string
      size: number      // bytes
      mimeType: string
    }
  | {
      kind: "recorded"
      url: string       // object URL — revoke when done
      duration: number  // seconds
      size: number      // bytes
    }

interface AudioSourceState {
  source: AudioSource | null
  // Drive navigation: when true the app should show TrackInfo
  readyToNavigate: boolean
}

const initialState: AudioSourceState = {
  source: null,
  readyToNavigate: false,
}

const audioSourceSlice = createSlice({
  name: "audioSource",
  initialState,
  reducers: {
    setAudioSource(state, action: PayloadAction<AudioSource>) {
      // Revoke the previous object URL to avoid memory leaks
      if (state.source?.url) {
        URL.revokeObjectURL(state.source.url)
      }
      state.source = action.payload
      state.readyToNavigate = true
    },
    clearAudioSource(state) {
      if (state.source?.url) {
        URL.revokeObjectURL(state.source.url)
      }
      state.source = null
      state.readyToNavigate = false
    },
    clearNavigation(state) {
      state.readyToNavigate = false
    },
  },
})

export const { setAudioSource, clearAudioSource, clearNavigation } = audioSourceSlice.actions
export default audioSourceSlice.reducer