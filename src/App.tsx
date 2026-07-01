import { useEffect } from 'react';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import AdminPage from './pages/AdminPage';
import Notification from './components/Notification';
import NebulaBackground from './components/NebulaBackground';
import InviteModal from './components/InviteModal';
import UpgradeModal from './components/UpgradeModal';
import ImmersiveReader from './components/ImmersiveReader';
import SubmitAnimation from './components/SubmitAnimation';

function App() {
  const { page, loading, session, user, setPage } = useStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const { data, error } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Session recuperee:', data.session.user.email);
          window.location.hash = '';
        }
        if (error) {
          console.error('Erreur auth:', error);
        }
      }
    };
    void handleAuthCallback();
  }, []);

  useEffect(() => {
    if (!loading && session && user && page === 'landing') {
      setPage('app');
    }
  }, [loading, session, user, page, setPage]);

  useEffect(() => {
    if (!loading && !session && !user) {
      const seen = localStorage.getItem('legacychain-onboarding');
      setPage(seen ? 'landing' : 'onboarding');
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
      <InviteModal />
      <UpgradeModal />
      <ImmersiveReader />
      <SubmitAnimation />
      <Notification />
    </div>
  );
}

export default App;
