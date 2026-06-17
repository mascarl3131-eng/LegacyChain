import { useEffect } from 'react';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import AdminPage from './pages/AdminPage';
import Notification from './components/Notification';
import NebulaBackground from './components/NebulaBackground';

function App() {
  const { page, loading, session, user, setPage } = useStore();

  // Handle OAuth callback hash from Supabase
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Supabase automatically handles the hash
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Session récupérée:', data.session.user.email);
          window.location.hash = ''; // Clean the hash
        }
        if (error) {
          console.error('Erreur auth:', error);
        }
      }
    };
    handleAuthCallback();
  }, []);

  // Auto-redirect: if logged in, go to app; if not, go to landing
  useEffect(() => {
    if (!loading) {
      if (session && user && page === 'landing') {
        setPage('app');
      }
    }
  }, [loading, session, user, page, setPage]);

  // Onboarding only on first visit (no session)
  useEffect(() => {
    if (!loading && !session && !user) {
      const seen = localStorage.getItem('legacychain-onboarding');
      if (!seen) {
        setPage('onboarding');
      } else {
        setPage('landing');
      }
    }
  }, [loading, session, user, setPage]);

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050510',
        color: '#00FFD1',
        fontFamily: "'Cinzel',serif",
        fontSize: '1.2rem',
        zIndex: 9999,
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <NebulaBackground />
      {page === 'onboarding' && <OnboardingPage />}
      {page === 'landing' && <LandingPage />}
      {page === 'app' && <AppPage />}
      {page === 'admin' && <AdminPage />}
      <Notification />
    </div>
  );
}

export default App;
