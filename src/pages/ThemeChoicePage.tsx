import { Check } from 'lucide-react';
import { useStore, type ThemeName } from '@/lib/store';

const OPTIONS: { id: ThemeName; title: string; subtitle: string; colors: string[] }[] = [
  { id: 'paper', title: 'Papier', subtitle: 'Clair, simple, tres lisible', colors: ['#FFF8EA', '#2E261B', '#174C7A'] },
  { id: 'heritage', title: 'Heritage', subtitle: 'Sombre, chaud, premium', colors: ['#10130F', '#F7F1DF', '#E6C36A'] },
];

export default function ThemeChoicePage() {
  const { page, theme, setTheme, setPage, lang } = useStore();
  if (page !== 'theme') return null;

  const choose = (nextTheme: ThemeName) => {
    setTheme(nextTheme);
    localStorage.setItem('legacychain-theme-confirmed', '1');
    setPage('app');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 6,
        display: 'grid',
        placeItems: 'center',
        padding: '1.2rem',
        overflowY: 'auto',
      }}
    >
      <section
        className="glass-card"
        style={{
          width: 'min(420px, 92vw)',
          padding: '1.2rem',
          textAlign: 'center',
          background: 'var(--glass)',
          borderColor: 'var(--glass-border)',
        }}
      >
        <div className="font-display" style={{ color: 'var(--text)', fontSize: '1.05rem', letterSpacing: '.08em', marginBottom: '.35rem' }}>
          {lang === 'fr' ? 'Choisis ton theme' : 'Choose your theme'}
        </div>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-soft)', fontSize: '.68rem', lineHeight: 1.65 }}>
          {lang === 'fr'
            ? "Tu pourras le changer plus tard dans le menu."
            : 'You can change it later in the menu.'}
        </p>

        <div style={{ display: 'grid', gap: '.75rem' }}>
          {OPTIONS.map(option => {
            const active = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                style={{
                  minHeight: 88,
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 24px',
                  alignItems: 'center',
                  gap: '.8rem',
                  padding: '.85rem',
                  borderRadius: 10,
                  border: active ? '2px solid var(--menu-active)' : '1px solid var(--glass-border)',
                  background: active ? 'var(--menu-bg-soft)' : 'var(--glass)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--body-font)',
                }}
              >
                <span style={{ display: 'flex', width: 62, height: 46, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,.18)' }}>
                  {option.colors.map(color => <span key={color} style={{ flex: 1, background: color }} />)}
                </span>
                <span>
                  <strong style={{ display: 'block', color: 'var(--text)', fontSize: '.92rem', marginBottom: '.18rem' }}>{option.title}</strong>
                  <span style={{ display: 'block', color: 'var(--text-soft)', fontSize: '.64rem', lineHeight: 1.45 }}>{option.subtitle}</span>
                </span>
                {active && <Check size={18} color="var(--menu-active)" />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
