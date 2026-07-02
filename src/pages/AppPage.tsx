import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getDemoMsgs, getDemoHumanity } from '@/lib/data';
import AppNav from '@/components/AppNav';
import SideMenu from '@/components/SideMenu';
import BottomTicker from '@/components/BottomTicker';
import FamilyLegacyTab from '@/tabs/FamilyLegacyTab';
import TreeTab from '@/tabs/TreeTab';
import OriginsTab from '@/tabs/OriginsTab';
import LifeJourneyTab from '@/tabs/LifeJourneyTab';
import ChallengesTab from '@/tabs/ChallengesTab';
import BookTab from '@/tabs/BookTab';
import HumanityTab from '@/tabs/HumanityTab';
import MobileTabBar from '@/components/MobileTabBar';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import BugReportModal from '@/components/BugReportModal';

const TABS: Record<string, React.FC> = {
  chain: FamilyLegacyTab,
  tree: TreeTab,
  origins: OriginsTab,
  journey: LifeJourneyTab,
  mural: FamilyLegacyTab,
  challenges: ChallengesTab,
  book: BookTab,
  humanity: HumanityTab,
};

export default function AppPage() {
  const { page, tab, user, session, lang, familyName, activeFamilyId, msgs, hMsgs, setActiveFamilyId, setMsgs, setHMsgs, showNotif } = useStore();
  const [bugReportOpen, setBugReportOpen] = useState(false);

  useEffect(() => {
    if (page === 'app' && user) {
      if (!session && !msgs.length) setMsgs(getDemoMsgs(lang));
      if (!hMsgs.length) setHMsgs(getDemoHumanity(lang));
      const timer = setTimeout(() => {
        showNotif(`${t('welcome', lang)}, ${user.first} ✦`, '#00FFD1');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hMsgs.length, lang, msgs.length, page, session, setHMsgs, setMsgs, showNotif, user]);

  useEffect(() => {
    if (page !== 'app' || !session) return;
    let active = true;
    const headers = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };

    const loadCloudFamily = async () => {
      const familiesResponse = await fetch('/api/families', { headers });
      const familiesData = await familiesResponse.json().catch(() => ({}));
      if (!familiesResponse.ok) throw new Error(familiesData.error || 'Family loading failed');

      let familyId = activeFamilyId || familiesData.families?.[0]?.family?.id;
      if (!familyId) {
        const createResponse = await fetch('/api/families', {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'create', name: familyName || user?.last || 'My family' }),
        });
        const created = await createResponse.json().catch(() => ({}));
        if (!createResponse.ok) throw new Error(created.error || 'Family creation failed');
        familyId = created.family.id;
      }
      if (!active) return;
      setActiveFamilyId(familyId);

      const messagesResponse = await fetch(`/api/family-messages?familyId=${encodeURIComponent(familyId)}`, { headers });
      const messagesData = await messagesResponse.json().catch(() => ({}));
      if (!messagesResponse.ok) throw new Error(messagesData.error || 'Message loading failed');
      if (active) setMsgs(messagesData.messages || []);
    };

    loadCloudFamily().catch(error => {
      console.error('Family cloud loading:', error);
      if (active) showNotif(t('familyCloudError', lang), '#FF6B6B');
    });
    return () => { active = false; };
  }, [activeFamilyId, familyName, lang, page, session, setActiveFamilyId, setMsgs, showNotif, user?.last]);

  if (page !== 'app') return null;

  const TabComponent = TABS[tab] || HumanityTab;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppNav />
      <SideMenu />

      <div
        className="app-scroll-region"
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
      <MobileTabBar />
      <InstallAppPrompt />
      <button
        type="button"
        onClick={() => setBugReportOpen(true)}
        aria-label={t('reportBug', lang)}
        title={t('reportBug', lang)}
        style={{
          position: 'fixed', right: 14, bottom: 78, zIndex: 120,
          width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center',
          border: '1px solid rgba(0,255,209,.38)', background: 'rgba(4,3,10,.94)',
          color: '#00FFD1', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,.4)',
        }}
      >
        <Bug size={18} />
      </button>
      <BugReportModal open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </div>
  );
}
