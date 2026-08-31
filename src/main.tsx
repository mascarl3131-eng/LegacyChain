import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './lib/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
    });
    await registration.update();

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (sessionStorage.getItem('legacychain-sw-reloaded')) return;
      sessionStorage.setItem('legacychain-sw-reloaded', '1');
      window.location.reload();
    });
  });
}
