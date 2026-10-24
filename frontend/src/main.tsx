import './lib/fetchPolyfill';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';
import { supabase } from './lib/supabase';

// On app start (once, before showing pages):
// If localStorage 'nt_session_only' === '1' AND sessionStorage 'nt_tab_alive' is missing ->
// the browser was closed, so call supabase.auth.signOut() and remove 'nt_session_only'.
// Otherwise set sessionStorage 'nt_tab_alive' = '1'.
try {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('nt_session_only') === '1' && !sessionStorage.getItem('nt_tab_alive')) {
      supabase.auth.signOut();
      localStorage.removeItem('nt_session_only');
    } else {
      sessionStorage.setItem('nt_tab_alive', '1');
    }
  }
} catch {
  // Ignore storage exceptions
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

