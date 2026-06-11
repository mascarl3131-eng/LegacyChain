import { useStore } from '@/lib/store';
import { t, LANGS } from '@/lib/i18n';
import type { TabName } from '@/lib/store';

const FAMILY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'chain', icon: '⬡', labelKey: 'navChain' },
  { id: 'tree', icon: '🌳', labelKey: 'navTree' },
  { id: 'origins', icon: '🧬', labelKey: 'navOrigins' },
  { id: 'mural', icon: '🎨', labelKey: 'navMural' },
];

const LEGACY_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'challenges', icon: '🏆', labelKey: 'navChal' },
  { id: 'book', icon: '📖', labelKey: 'navBook' },
];

const WORLD_TABS: { id: TabName; icon: string; labelKey: string }[] = [
  { id: 'humanity', icon: '🌍', labelKey: 'navHumanity' },
];

export default function SideMenu() {
  const { sideMenuOpen, setSideMenuOpen, tab, setTab, lang, setLang, premium, setUpgradeOpen, setInviteOpen } = useStore();

  const handleTab = (id: TabName) => {
    setTab(id);
    setSideMenuOpen(false);
  };

  const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ fontSize: '0.55rem', letterSpacing: '0.25em', color: 'rgba(239,246,255,0.25)', padding: '0.4rem 1.2rem', textTransform: 'uppercase' as const }}>
      {children}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: 'rgba(0,255,209,0.13)', margin: '0.4rem 1.2rem' }} />;

  const MenuItem = ({ id, icon, labelKey }: { id: TabName; icon: string; labelKey: string }) => (
    <div
      onClick={() => handleTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        padding: '0.75rem 1.2rem',
        fontSize: '0.78rem',
        color: tab === id ? '#00FFD1' : 'rgba(239,246,255,0.6)',
        cursor: 'pointer',
        letterSpacing: '0.06em',
        transition: 'all 0.2s',
        borderLeft: tab === id ? '2px solid #00FFD1' : '2px solid transparent',
        background: tab === id ? 'rgba(0,255,209,0.04)' : 'transparent',
      }}
    >
      {icon} {t(labelKey, lang)}
    </div>
  );

  return (
    <>
      {sideMenuOpen && (
        <div
          onClick={() => setSideMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 299,
            background: 'rgba(4,3,10,0.6)',
          }}
        />
      )}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: sideMenuOpen ? 0 : -280,
          width: 260,
          height: '100%',
          zIndex: 300,
          background: '#090716',
          borderRight: '1px solid rgba(0,255,209,0.13)',
          transition: 'left 0.3s',
          overflowY: 'auto',
          padding: '1.5rem 0 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.2rem 1.2rem', borderBottom: '1px solid rgba(0,255,209,0.13)', marginBottom: '0.5rem' }}>
          <span className="font-display" style={{ fontSize: '0.82rem', color: '#00FFD1', letterSpacing: '0.15em' }}>⬡ LEGACYCHAIN</span>
          <button onClick={() => setSideMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.4)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
        </div>

        <SectionTitle>{t('familySection', lang)}</SectionTitle>
        {FAMILY_TABS.map(t => <MenuItem key={t.id} {...t} />)}

        <Divider />
        <SectionTitle>{t('legacySection', lang)}</SectionTitle>
        {LEGACY_TABS.map(t => <MenuItem key={t.id} {...t} />)}

        <Divider />
        <SectionTitle>{t('worldSection', lang)}</SectionTitle>
        {WORLD_TABS.map(t => <MenuItem key={t.id} {...t} />)}

        <Divider />
        <SectionTitle>{t('settings', lang)}</SectionTitle>
        <div onClick={() => { setInviteOpen(true); setSideMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 1.2rem', fontSize: '0.78rem', color: 'rgba(239,246,255,0.6)', cursor: 'pointer', letterSpacing: '0.06em' }}>
          + {t('inviteBtn', lang)}
        </div>

        <div style={{ padding: '0.6rem 1.2rem' }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            style={{
              width: '100%',
              background: 'rgba(4,3,10,0.8)',
              border: '1px solid rgba(0,255,209,0.13)',
              color: '#EFF6FF',
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.72rem',
              padding: '0.45rem 0.7rem',
              borderRadius: 6,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Object.values(LANGS).map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
            ))}
          </select>
        </div>

        {!premium && (
          <div style={{ margin: '1rem 1.2rem 0', padding: '0.7rem', background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.22)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setUpgradeOpen(true); setSideMenuOpen(false); }}>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,179,71,0.7)', letterSpacing: '0.06em', lineHeight: 1.6, marginBottom: '0.5rem' }}>{t('upgradeDesc', lang)}</p>
            <button className="btn-amber" style={{ width: '100%', marginTop: 0 }}>✦ {t('unlockBtn', lang)}</button>
          </div>
        )}
      </div>
    </>
  );
}
