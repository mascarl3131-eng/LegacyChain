import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { t, TYPEWRITER_PHRASES } from '@/lib/i18n';

const FEATURES = [
  { icon: '⬡', title: 'FAMILY CHAIN', desc: 'Messages sealed across generations · time-lock capsules', color: '#00FFD1' },
  { icon: '🌳', title: 'FAMILY TREE', desc: 'Interactive genealogy · pulsing message nodes', color: '#00FFD1' },
  { icon: '🧬', title: 'ORIGINS & DNA', desc: '3D rotating globe · family migration timeline', color: '#00FFD1' },
  { icon: '🎨', title: 'FAMILY MURAL', desc: 'Collaborative canvas · draw together across time', color: '#C084FC', premium: true },
  { icon: '🏆', title: 'CHALLENGES', desc: 'Questions echoing through decades · answer together', color: '#00FFD1' },
  { icon: '📖', title: 'BOOK OF LIFE', desc: '6-chapter digital legacy · PDF export', color: '#C084FC', premium: true },
  { icon: '🌍', title: 'VOICES OF HUMANITY', desc: 'Public messages to future generations worldwide', color: '#00FFD1' },
  { icon: '🎙', title: 'AUDIO & VIDEO', desc: 'Record your voice · 3 min audio · 60 sec video', color: '#FFB347', premium: true },
];

export default function LandingPage() {
  const { page, login, lang } = useStore();
  const [twI, setTwI] = useState(0);
  const [twC, setTwC] = useState(0);
  const [twDel, setTwDel] = useState(false);
  const [counters, setCounters] = useState({ fam: 0, msg: 0, cap: 0 });
  const typewriterRef = useRef<HTMLSpanElement>(null);

  const phrases = TYPEWRITER_PHRASES[lang] || TYPEWRITER_PHRASES.en;

  // Typewriter effect
  useEffect(() => {
    if (page !== 'landing') return;

    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const p = phrases[twI];
      if (!twDel) {
        const nextC = twC + 1;
        setTwC(nextC);
        if (nextC >= p.length) {
          setTwDel(true);
          timeout = setTimeout(tick, 2200);
          return;
        }
        timeout = setTimeout(tick, 72);
      } else {
        const nextC = Math.max(0, twC - 2);
        setTwC(nextC);
        if (nextC <= 0) {
          setTwDel(false);
          setTwI((twI + 1) % phrases.length);
        }
        timeout = setTimeout(tick, 35);
      }
    }

    timeout = setTimeout(tick, 72);
    return () => clearTimeout(timeout);
  }, [page, twI, twC, twDel, phrases]);

  // Counter animation
  useEffect(() => {
    if (page !== 'landing') return;

    const targets = { fam: 12847, msg: 94320, cap: 3201 };
    const steps = 70;
    let frame = 0;

    const iv = setInterval(() => {
      frame++;
      const progress = frame / steps;
      setCounters({
        fam: Math.min(Math.floor(targets.fam * progress), targets.fam),
        msg: Math.min(Math.floor(targets.msg * progress), targets.msg),
        cap: Math.min(Math.floor(targets.cap * progress), targets.cap),
      });
      if (frame >= steps) clearInterval(iv);
    }, 16);

    return () => clearInterval(iv);
  }, [page]);

  const handleLogin = (fb: boolean) => {
    const name = fb
      ? (prompt('Enter your full name:', 'Jean Doe') || 'Jean Doe')
      : (prompt(t('yourName', lang) + ':', 'Marie Dupont') || 'Marie Dupont');
    login(name, fb);
  };

  if (page !== 'landing') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.95rem', maxWidth: 320, textAlign: 'center' }}>
        {/* Tagline */}
        <div style={{ fontSize: '0.56rem', letterSpacing: '0.3em', color: 'rgba(0,255,209,0.6)' }}>
          ✦ HÉRITAGE · CHAÎNE · ∞
        </div>

        {/* Typewriter */}
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 'clamp(0.95rem,3.5vw,1.9rem)',
            color: '#EFF6FF',
            minHeight: '3.2em',
            lineHeight: 1.45,
            overflow: 'hidden',
            width: 'min(300px,88vw)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span
            ref={typewriterRef}
            style={{
              position: 'absolute',
              inset: 0,
              textAlign: 'center',
              whiteSpace: 'normal',
              borderRight: '2px solid #00FFD1',
              animation: 'blink 1s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0.25rem',
            }}
          >
            {phrases[twI]?.slice(0, twC) || ''}
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.4)', lineHeight: 1.95, width: 260, flexShrink: 0, marginTop: '0.1rem' }}>
          {t('landingSub', lang)}
        </p>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', width: 'min(320px,90vw)', margin: '0.2rem 0' }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: f.color === '#C084FC' ? 'rgba(192,132,252,0.04)' : f.color === '#FFB347' ? 'rgba(255,179,71,0.04)' : 'rgba(0,255,209,0.04)',
                border: `1px solid ${f.color === '#C084FC' ? 'rgba(192,132,252,0.1)' : f.color === '#FFB347' ? 'rgba(255,179,71,0.1)' : 'rgba(0,255,209,0.1)'}`,
                borderRadius: 8,
                padding: '0.6rem 0.75rem',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.58rem', color: f.color, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                {f.icon} {f.title} {f.premium && '✦'}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.4)', lineHeight: 1.5 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Premium Note */}
        <div style={{ fontSize: '0.55rem', color: 'rgba(255,179,71,0.5)', letterSpacing: '0.08em' }}>
          ✦ Premium features — unlock forever for $10
        </div>

        {/* Auth Buttons */}
        <button
          onClick={() => handleLogin(true)}
          style={{
            width: 'min(260px,80vw)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            background: '#1877F2',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.927-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          <span>{t('fbLogin', lang)}</span>
        </button>

        <button
          onClick={() => handleLogin(false)}
          style={{
            width: 'min(260px,80vw)',
            flexShrink: 0,
            padding: '0.7rem',
            background: 'transparent',
            border: '1px solid rgba(239,246,255,0.14)',
            color: 'rgba(239,246,255,0.4)',
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.7rem',
            cursor: 'pointer',
            borderRadius: 10,
          }}
        >
          {t('guestLogin', lang)}
        </button>

        {/* Counters */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.6rem', color: 'rgba(239,246,255,0.32)', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', color: '#00FFD1', fontWeight: 500 }}>{counters.fam.toLocaleString()}</div>
            <span>{t('families', lang)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', color: '#00FFD1', fontWeight: 500 }}>{counters.msg.toLocaleString()}</div>
            <span>{t('messages', lang)}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', color: '#00FFD1', fontWeight: 500 }}>{counters.cap.toLocaleString()}</div>
            <span>{t('capsules', lang)}</span>
          </div>
        </div>

        <div style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(0,255,209,0.2)', paddingBottom: '0.5rem' }}>
          A BLOCKCHAIN OF LOVE · SEALED IN LIGHT
        </div>
      </div>
    </div>
  );
}
