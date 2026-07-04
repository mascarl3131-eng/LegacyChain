import { useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import TextSizeControl from '@/components/TextSizeControl';

export default function AppNav() {
  const { user, session, premium, setSideMenuOpen, setPage, lang } = useStore();
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoDown = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      const pwd = prompt(t('adminPassword', lang));
      if (pwd === 'legacy2025') setPage('admin');
    }, 1500);
  }, [lang, setPage]);

  const handleLogoUp = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  if (!user) return null;

  return (
    <nav
      className="app-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 46,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        background: 'rgba(23,26,20,0.97)',
        borderBottom: '1px solid rgba(230,195,106,0.24)',
      }}
    >
      <button
        onClick={() => setSideMenuOpen(true)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem 0.3rem', display: 'flex', flexDirection: 'column', gap: 5 }}
        aria-label="Menu"
      >
        <div style={{ width: 20, height: 2, background: 'var(--menu-active)', borderRadius: 1 }} />
        <div style={{ width: 20, height: 2, background: 'var(--menu-active)', borderRadius: 1 }} />
        <div style={{ width: 20, height: 2, background: 'var(--menu-active)', borderRadius: 1 }} />
      </button>

      <div
        className="font-display"
        style={{ fontSize: '0.88rem', color: 'var(--menu-active)', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none', fontWeight: 700 }}
        onMouseDown={handleLogoDown}
        onMouseUp={handleLogoUp}
        onMouseLeave={handleLogoUp}
        onTouchStart={handleLogoDown}
        onTouchEnd={handleLogoUp}
      >
        ⬡ LEGACYCHAIN
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <TextSizeControl compact />
        <button
          type="button"
          onClick={() => setSideMenuOpen(true)}
          aria-label={t('accountSection', lang)}
          style={{
            border: 'none',
            padding: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: session ? 'linear-gradient(135deg,var(--menu-active),var(--menu-accent))' : 'rgba(230,195,106,0.14)',
            outline: session ? 'none' : '1px solid rgba(230,195,106,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: session ? '#10130F' : 'var(--menu-active)',
            cursor: 'pointer',
          }}
        >
          {user.first[0].toUpperCase()}
        </button>
        {premium && (
          <span
            title="Premium"
            aria-label="Premium"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'linear-gradient(135deg,#F4D06F,#A67C32)',
              color: '#10130F',
              fontSize: '0.6rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(255,215,0,.25)',
            }}
          >
            P
          </span>
        )}
      </div>
    </nav>
  );
}
