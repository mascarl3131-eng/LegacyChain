import { useStore } from '@/lib/store';
import { t, LANGS } from '@/lib/i18n';
import type { TabName } from '@/lib/store';

const FAMILY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'chain', icon: '⬡', labelKey: 'navFamilyLegacy' },
  { id: 'humanity', icon: '🌍', labelKey: 'navHumanity' },
  { id: 'tree', icon: '🌳', labelKey: 'navTree' },
  { id: 'origins', icon: '🧬', labelKey: 'navOrigins' },
];

const LEGACY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'book', icon: '📖', labelKey: 'navBook' },
  { id: 'challenges', icon: '🏆', labelKey: 'navChal' },
];

const LEGAL_LINKS = [
  ['privacyPolicy', '/legal/privacy.html'],
  ['termsPolicy', '/legal/terms.html'],
  ['cookiesPolicy', '/legal/cookies.html'],
  ['dataDeletionPolicy', '/legal/data-deletion.html'],
  ['refundPolicy', '/legal/refund.html'],
] as const;

function SectionTitle({ children }: { children: string }) {
  return <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(239,246,255,0.25)', padding: '0.4rem 1.2rem', textTransform: 'uppercase' }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(0,255,209,0.13)', margin: '0.4rem 1.2rem' }} />;
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
    <button type="button" key={id} onClick={() => handleTab(id)} style={{ width: '100%', border: 'none', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1.2rem', fontFamily: "'DM Mono',monospace", fontSize: '0.78rem', color: tab === id ? '#00FFD1' : 'rgba(239,246,255,0.6)', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.06em', transition: 'all 0.2s', borderLeft: tab === id ? '2px solid #00FFD1' : '2px solid transparent', background: tab === id ? 'rgba(0,255,209,0.04)' : 'transparent' }}>
      {icon} {t(labelKey, lang)}
    </button>
  );

  return (
    <>
      {sideMenuOpen && <div onClick={() => setSideMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1099, background: 'rgba(4,3,10,0.6)' }} />}
      <div
        aria-hidden={!sideMenuOpen}
        style={{
          position: 'fixed', top: 0, left: sideMenuOpen ? 0 : -280, width: 260, height: '100%', zIndex: 1100,
          background: '#090716', borderRight: '1px solid rgba(0,255,209,0.13)', transition: 'left 0.3s',
          overflowY: 'auto', padding: '1.5rem 0 2rem', pointerEvents: sideMenuOpen ? 'auto' : 'none',
          visibility: sideMenuOpen ? 'visible' : 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.2rem 1.2rem', borderBottom: '1px solid rgba(0,255,209,0.13)', marginBottom: '0.5rem' }}>
          <span className="font-display" style={{ fontSize: '0.82rem', color: '#00FFD1', letterSpacing: '0.15em' }}>⬡ LEGACYCHAIN</span>
          <button onClick={() => setSideMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.4)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
        </div>

        <SectionTitle>{t('familySection', lang)}</SectionTitle>
        {FAMILY_TABS.map(renderMenuItem)}

        <Divider />
        <SectionTitle>{t('legacySection', lang)}</SectionTitle>
        {LEGACY_TABS.map(renderMenuItem)}

        <Divider />
        <SectionTitle>{t('accountSection', lang)}</SectionTitle>
        <div style={{ margin: '0.25rem 1.2rem 0.8rem', padding: '0.85rem', borderRadius: 10, background: session ? 'rgba(0,255,209,0.045)' : 'rgba(255,179,71,0.045)', border: `1px solid ${session ? 'rgba(0,255,209,0.2)' : 'rgba(255,179,71,0.25)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: session ? '0.65rem' : '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: session ? 'linear-gradient(135deg,#00FFD1,#C084FC)' : 'rgba(255,179,71,0.13)', border: session ? 'none' : '1px solid rgba(255,179,71,0.35)', color: session ? '#04030A' : '#FFB347', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
              {user?.first?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.62rem', color: session ? '#00FFD1' : '#FFB347', letterSpacing: '0.08em', marginBottom: '0.18rem' }}>{session ? t('connectedAs', lang) : t('guestMode', lang)}</div>
              <div style={{ fontSize: '0.66rem', color: 'rgba(239,246,255,0.68)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user.email || user?.name || t('guestMode', lang)}</div>
            </div>
          </div>

          {session ? (
            <button type="button" onClick={() => void logout()} style={{ width: '100%', padding: '0.55rem', borderRadius: 7, border: '1px solid rgba(239,246,255,0.15)', background: 'rgba(239,246,255,0.03)', color: 'rgba(239,246,255,0.62)', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', cursor: 'pointer' }}>{t('logoutBtn', lang)}</button>
          ) : (
            <>
              <p style={{ fontSize: '0.57rem', color: 'rgba(239,246,255,0.38)', lineHeight: 1.55, margin: '0 0 0.65rem' }}>{t('guestModeDesc', lang)}</p>
              <button type="button" onClick={() => void loginWithGoogle()} style={{ width: '100%', padding: '0.58rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.9)', background: '#fff', color: '#252525', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', cursor: 'pointer' }}>G&nbsp;&nbsp;{t('googleLogin', lang)}</button>
            </>
          )}
        </div>

        <Divider />
        <SectionTitle>{t('settings', lang)}</SectionTitle>
        <div onClick={() => { setInviteOpen(true); setSideMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1.2rem', fontSize: '0.78rem', color: 'rgba(239,246,255,0.6)', cursor: 'pointer', letterSpacing: '0.06em' }}>+ {t('inviteBtn', lang)}</div>

        <div style={{ padding: '0.6rem 1.2rem' }}>
          <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} style={{ width: '100%', background: 'rgba(4,3,10,0.8)', border: '1px solid rgba(0,255,209,0.13)', color: '#EFF6FF', fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', padding: '0.45rem 0.7rem', borderRadius: 6, outline: 'none', cursor: 'pointer' }}>
            {Object.values(LANGS).map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
          </select>
        </div>

        {!premium && (
          <div style={{ margin: '1rem 1.2rem 0', padding: '0.7rem', background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.22)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setUpgradeOpen(true); setSideMenuOpen(false); }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,179,71,0.7)', letterSpacing: '0.06em', lineHeight: 1.6, marginBottom: '0.5rem' }}>{t('upgradeDesc', lang)}</p>
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
