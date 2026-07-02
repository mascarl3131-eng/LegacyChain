import { useEffect, useRef } from 'react';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import { t } from './lib/i18n';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import AdminPage from './pages/AdminPage';
import Notification from './components/Notification';
import NebulaBackground from './components/NebulaBackground';
import UpgradeModal from './components/UpgradeModal';
import InviteModal from './components/InviteModal';

function App() {
  const { page, loading, session, user, setPage, showNotif, lang } = useStore();
  const acceptedFamilyInvite = useRef<string | null>(null);

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

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('familyInvite');
    if (!token || acceptedFamilyInvite.current === token) return;
    acceptedFamilyInvite.current = token;
    fetch('/api/families', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', token }),
    }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('familyActionError', lang));
      showNotif(t('familyJoinedSuccess', lang), '#00FFD1');
      window.history.replaceState({}, '', window.location.pathname);
    }).catch(reason => {
      acceptedFamilyInvite.current = null;
      showNotif(reason.message, '#FF6B6B');
    });
  }, [lang, session, showNotif]);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/admin' || params.get('admin') === '1') {
      setPage('admin');
    }
  }, [loading, setPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('src') || params.get('utm_source') || '';
    const payload = {
      action: 'trackVisit',
      path: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer,
      source,
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/admin-premium-preview', blob);
      return;
    }

    fetch('/api/admin-premium-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, []);

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
      <UpgradeModal />
      <InviteModal />
      <Notification />
    </div>
  );
}

export default App;
