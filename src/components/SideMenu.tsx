import { useStore } from '@/lib/store';
import { t, LANGS } from '@/lib/i18n';
import type { TabName } from '@/lib/store';
import GetAppButton from '@/components/GetAppButton';

const FAMILY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'chain', icon: '⬡', labelKey: 'navFamilyLegacy' },
  { id: 'tree', icon: '🌳', labelKey: 'navTree' },
  { id: 'origins', icon: '🧬', labelKey: 'navOrigins' },
  { id: 'journey', icon: '◇', labelKey: 'lifeJourneyTab' },
  { id: 'book', icon: '📖', labelKey: 'navBook' },
  { id: 'challenges', icon: '🏆', labelKey: 'navChal' },
];

const LEGACY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'humanity', icon: '🌍', labelKey: 'navHumanity' },
];

const LEGAL_LINKS = [
  ['privacyPolicy', '/legal/privacy.html'],
  ['termsPolicy', '/legal/terms.html'],
  ['cookiesPolicy', '/legal/cookies.html'],
  ['dataDeletionPolicy', '/legal/data-deletion.html'],
  ['refundPolicy', '/legal/refund.html'],
] as const;

function SectionTitle({ children }: { children: string }) {
  return <div style={{ fontSize: '0.64rem', letterSpacing: '0.08em', color: 'rgba(247,241,223,0.74)', padding: '0.55rem 1.2rem 0.35rem', textTransform: 'uppercase', fontWeight: 700 }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(230,195,106,0.18)', margin: '0.55rem 1.2rem' }} />;
}

export default function SideMenu() {
  const {
    sideMenuOpen, setSideMenuOpen, tab, setTab, lang, setLang, premium,
    setUpgradeOpen, setInviteOpen, user, session, loginWithGoogle, logout,
  } = useStore();

  const handleTab = (id: TabName) => {
    setTab(id);
    setSideMenuOpen(false);
  };

  const renderMenuItem = ({ id, icon, labelKey }: { id: TabName; icon: string; labelKey: string }) => (
    <button type="button" key={id} onClick={() => handleTab(id)} style={{ width: '100%', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.2rem', fontFamily: 'var(--body-font)', fontSize: '0.88rem', color: tab === id ? 'var(--menu-active)' : 'rgba(247,241,223,0.88)', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.01em', transition: 'all 0.2s', borderLeft: tab === id ? '4px solid var(--menu-active)' : '4px solid transparent', background: tab === id ? 'rgba(230,195,106,0.1)' : 'transparent', fontWeight: tab === id ? 700 : 400 }}>
      {icon} {t(labelKey, lang)}
    </button>
  );

  return (
    <>
      {sideMenuOpen && <div onClick={() => setSideMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1099, background: 'rgba(16,19,15,0.62)' }} />}
      <div
        aria-hidden={!sideMenuOpen}
        style={{
          position: 'fixed', top: 0, left: sideMenuOpen ? 0 : -280, width: 260, height: '100%', zIndex: 1100,
          background: 'var(--menu-bg)', borderRight: '1px solid rgba(230,195,106,0.22)', transition: 'left 0.3s',
          overflowY: 'auto', padding: '1.5rem 0 2rem', pointerEvents: sideMenuOpen ? 'auto' : 'none',
          visibility: sideMenuOpen ? 'visible' : 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.2rem 1.2rem', borderBottom: '1px solid rgba(230,195,106,0.22)', marginBottom: '0.5rem' }}>
          <span className="font-display" style={{ fontSize: '0.9rem', color: 'var(--menu-active)', letterSpacing: '0.05em', fontWeight: 700 }}>⬡ LEGACYCHAIN</span>
          <button onClick={() => setSideMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(247,241,223,0.68)', fontSize: '1.35rem', cursor: 'pointer' }}>×</button>
        </div>

        <SectionTitle>{t('legacySection', lang)}</SectionTitle>
        {LEGACY_TABS.map(renderMenuItem)}

        <Divider />
        <SectionTitle>{t('familySection', lang)}</SectionTitle>
        {FAMILY_TABS.map(renderMenuItem)}

        <Divider />
        <SectionTitle>{t('accountSection', lang)}</SectionTitle>
        <div style={{ margin: '0.25rem 1.2rem 0.8rem', padding: '0.85rem', borderRadius: 10, background: session ? 'rgba(143,214,183,0.08)' : 'rgba(230,195,106,0.08)', border: `1px solid ${session ? 'rgba(143,214,183,0.24)' : 'rgba(230,195,106,0.26)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: session ? '0.65rem' : '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: session ? 'linear-gradient(135deg,var(--menu-active),var(--menu-accent))' : 'rgba(230,195,106,0.14)', border: session ? 'none' : '1px solid rgba(230,195,106,0.36)', color: session ? '#10130F' : 'var(--menu-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
              {user?.first?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: session ? 'var(--menu-accent)' : 'var(--menu-active)', letterSpacing: '0.03em', fontWeight: 700, marginBottom: '0.18rem' }}>{session ? t('connectedAs', lang) : t('guestMode', lang)}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(247,241,223,0.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user.email || user?.name || t('guestMode', lang)}</div>
            </div>
          </div>

          {session ? (
            <button type="button" onClick={() => void logout()} style={{ width: '100%', padding: '0.55rem', borderRadius: 7, border: '1px solid rgba(247,241,223,0.2)', background: 'rgba(247,241,223,0.055)', color: 'rgba(247,241,223,0.88)', fontFamily: 'var(--body-font)', fontSize: '0.72rem', cursor: 'pointer' }}>{t('logoutBtn', lang)}</button>
          ) : (
            <>
              <p style={{ fontSize: '0.66rem', color: 'rgba(247,241,223,0.78)', lineHeight: 1.55, margin: '0 0 0.65rem' }}>{t('guestModeDesc', lang)}</p>
              <button type="button" onClick={() => void loginWithGoogle()} style={{ width: '100%', padding: '0.58rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.9)', background: '#fff', color: '#252525', fontFamily: 'var(--body-font)', fontSize: '0.72rem', cursor: 'pointer' }}>G&nbsp;&nbsp;{t('googleLogin', lang)}</button>
            </>
          )}
        </div>

        <Divider />
        <SectionTitle>{t('settings', lang)}</SectionTitle>
        <div style={{ padding: '0.55rem 1.2rem' }}>
          <GetAppButton variant="menu" />
        </div>
        <div onClick={() => { setInviteOpen(true); setSideMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.82rem 1.2rem', fontSize: '0.86rem', color: 'rgba(247,241,223,0.9)', cursor: 'pointer', letterSpacing: '0.01em' }}>+ {t('inviteBtn', lang)}</div>

        <div style={{ padding: '0.6rem 1.2rem' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} style={{ width: '100%', background: 'rgba(16,19,15,0.88)', border: '1px solid rgba(230,195,106,0.24)', color: '#F7F1DF', fontFamily: 'var(--body-font)', fontSize: '0.78rem', padding: '0.52rem 0.7rem', borderRadius: 6, outline: 'none', cursor: 'pointer' }}>
            {Object.values(LANGS).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </div>

        {!premium && (
          <div style={{ margin: '1rem 1.2rem 0', padding: '0.7rem', background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.22)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setUpgradeOpen(true); setSideMenuOpen(false); }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,196,120,0.92)', letterSpacing: '0.06em', lineHeight: 1.6, marginBottom: '0.5rem' }}>{t('upgradeDesc', lang)}</p>
            <button className="btn-amber" style={{ width: '100%', marginTop: 0 }}>✦ {t('unlockBtn', lang)}</button>
          </div>
        )}

        <Divider />
        <SectionTitle>{t('legalDocuments', lang)}</SectionTitle>
        <div style={{ display: 'grid', gap: '.5rem', padding: '.45rem 1.2rem 0' }}>
          {LEGAL_LINKS.map(([labelKey, href]) => <a key={href} href={href} style={{ color: 'rgba(239,246,255,.72)', fontSize: '.64rem', textDecoration: 'none', lineHeight: 1.35 }}>{t(labelKey, lang)}</a>)}
        </div>
      </div>
    </>
  );
}

