import { Check } from 'lucide-react';
import { useStore, type ThemeName } from '@/lib/store';

const THEME_OPTIONS: { id: ThemeName; label: string; desc: string; colors: string[] }[] = [
  { id: 'heritage', label: 'Heritage', desc: 'Chaud, premium, lisible', colors: ['#F7F1DF', '#E6C36A', '#8FD6B7'] },
  { id: 'paper', label: 'Papier', desc: 'Clair, doux, senior', colors: ['#FFF8EA', '#6F4E37', '#174C7A'] },
];

export default function ThemeControl() {
  const { theme, setTheme } = useStore();

  return (
    <div style={{ display: 'grid', gap: '0.55rem' }}>
      {THEME_OPTIONS.map(option => {
        const active = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            style={{
              width: '100%',
              minHeight: 52,
              display: 'grid',
              gridTemplateColumns: '44px 1fr 22px',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 0.65rem',
              borderRadius: 8,
              border: active ? '1px solid var(--menu-active)' : '1px solid rgba(247,241,223,0.16)',
              background: active ? 'rgba(230,195,106,0.12)' : 'rgba(247,241,223,0.045)',
              color: 'var(--text)',
              fontFamily: 'var(--body-font)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ display: 'flex', width: 42, height: 28, borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.18)' }}>
              {option.colors.map(color => <span key={color} style={{ flex: 1, background: color }} />)}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: active ? 'var(--menu-active)' : 'var(--text)' }}>{option.label}</span>
              <span style={{ display: 'block', marginTop: 2, fontSize: '0.58rem', lineHeight: 1.35, color: 'var(--text-soft)' }}>{option.desc}</span>
            </span>
            {active && <Check size={16} color="var(--menu-active)" />}
          </button>
        );
      })}
    </div>
  );
}
