import type { PropsWithChildren, ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

import audioSourceReducer from "@/store/AudioSourceSlice";
import userReducer from "@/store/userSlice";
import queueReducer from "@/store/queueSlice";
import playContextReducer from "@/store/playContextSlice";

function createTestStore(preloadedState?: RenderWithProvidersOptions["preloadedState"]) {
  return configureStore({
    reducer: {
      audioSource: audioSourceReducer,
      user: userReducer,
      queue: queueReducer,
      playContext: playContextReducer,
    },
    preloadedState,
  });
}

export type TestStore = ReturnType<typeof createTestStore>;

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: {
    audioSource?: ReturnType<typeof audioSourceReducer>;
    user?: ReturnType<typeof userReducer>;
    queue?: ReturnType<typeof queueReducer>;
    playContext?: ReturnType<typeof playContextReducer>;
  };
  route?: string;
  store?: TestStore;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    route = "/",
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
