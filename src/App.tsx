import { StoreProvider } from '@/lib/store';
import NebulaBackground from '@/components/NebulaBackground';
import OnboardingPage from '@/pages/OnboardingPage';
import LandingPage from '@/pages/LandingPage';
import AppPage from '@/pages/AppPage';
import InviteModal from '@/components/InviteModal';
import UpgradeModal from '@/components/UpgradeModal';
import ImmersiveReader from '@/components/ImmersiveReader';
import SubmitAnimation from '@/components/SubmitAnimation';
import Notification from '@/components/Notification';
import { useStore } from '@/lib/store';

function AppContent() {
  const { page } = useStore();

  return (
    <>
      <NebulaBackground />
      <OnboardingPage />
      <LandingPage />
      {(page === 'app' || page === 'admin') && <AppPage />}
      <InviteModal />
      <UpgradeModal />
      <ImmersiveReader />
      <SubmitAnimation />
      <Notification />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
