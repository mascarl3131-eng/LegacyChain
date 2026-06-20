import { getDemoHumanity } from '@/lib/data';
import { useStore } from '@/lib/store';

export default function BottomTicker() {
  const { page, lang } = useStore();
  const localized = getDemoHumanity(lang).slice(0, 8).map(message => ({
    f: message.f,
    t: `${message.c} · ${message.y} — “${message.text}”`,
  }));
  const items = [...localized, ...localized];

  if (page !== 'app') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: 28,
        background: 'rgba(4,3,10,0.96)',
        borderTop: '1px solid rgba(0,255,209,0.1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 80s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((m, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0 2rem',
              fontSize: '0.58rem',
              color: 'rgba(255,179,71,0.6)',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            <span>{m.f}</span>
            {m.t}
            <span style={{ color: 'rgba(0,255,209,0.15)', margin: '0 0.6rem' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
