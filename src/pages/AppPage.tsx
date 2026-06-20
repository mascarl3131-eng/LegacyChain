import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getDemoMsgs, getDemoHumanity } from '@/lib/data';
import AppNav from '@/components/AppNav';
import SideMenu from '@/components/SideMenu';
import BottomTicker from '@/components/BottomTicker';
import ChainTab from '@/tabs/ChainTab';
import TreeTab from '@/tabs/TreeTab';
import OriginsTab from '@/tabs/OriginsTab';
import MuralTab from '@/tabs/MuralTab';
import ChallengesTab from '@/tabs/ChallengesTab';
import BookTab from '@/tabs/BookTab';
import HumanityTab from '@/tabs/HumanityTab';

const TABS: Record<string, React.FC> = {
  chain: ChainTab,
  tree: TreeTab,
  origins: OriginsTab,
  mural: MuralTab,
  challenges: ChallengesTab,
  book: BookTab,
  humanity: HumanityTab,
};

export default function AppPage() {
  const { page, tab, user, lang, setMsgs, setHMsgs, showNotif } = useStore();

  useEffect(() => {
    if (page === 'app' && user) {
      setMsgs(getDemoMsgs(lang));
      setHMsgs(getDemoHumanity(lang));
      const timer = setTimeout(() => {
        showNotif(`${t('welcome', lang)}, ${user.first} ✦`, '#00FFD1');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lang, page, setHMsgs, setMsgs, showNotif, user]);

  if (page !== 'app') return null;

  const TabComponent = TABS[tab] || ChainTab;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav />
      <SideMenu />

      <div
        style={{
          position: 'fixed',
          top: 46,
          left: 0,
          right: 0,
          bottom: 28,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '1rem' }}>
          <TabComponent />
        </div>
      </div>

      <BottomTicker />
    </div>
  );
}
