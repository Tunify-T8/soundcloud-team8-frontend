import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { setupMockApi } from './features/engagement/data/mockApi';
import { GoogleOAuthProvider } from '@react-oauth/google';
setupMockApi();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>    </Provider>
  </StrictMode>,
)
