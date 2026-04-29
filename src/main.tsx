import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initializeTheme } from "./features/settings/hooks/useTheme";

initializeTheme();

createRoot(document.getElementById('root')!).render(
  
    <Provider store={store}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>    
    </Provider>
)
