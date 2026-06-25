import { useEffect, useRef, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t, TYPEWRITER_PHRASES } from '@/lib/i18n';

const FEATURES = [
  { icon: '⬡', titleKey: 'chainTitle', descKey: 'featureChainDesc', color: '#00FFD1' },
  { icon: '🌳', titleKey: 'treeTitle', descKey: 'featureTreeDesc', color: '#00FFD1' },
  { icon: '🧬', titleKey: 'originsTitle', descKey: 'featureOriginsDesc', color: '#00FFD1' },
  { icon: '🎨', titleKey: 'navMural', descKey: 'featureMuralDesc', color: '#C084FC', premium: true },
  { icon: '🏆', titleKey: 'chalTitle', descKey: 'featureChallengesDesc', color: '#00FFD1' },
  { icon: '📖', titleKey: 'bookTitle', descKey: 'featureBookDesc', color: '#C084FC', premium: true },
  { icon: '🌍', titleKey: 'hvTitle', descKey: 'featureHumanityDesc', color: '#00FFD1' },
  { icon: '🎙', titleKey: 'audioVideo', descKey: 'featureAudioDesc', color: '#FFB347', premium: true },
];

export default function LandingPage() {
  const { page, login, loginWithGoogle, lang, loading } = useStore();
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

  const handleGuestLogin = () => {
    const name = prompt(t('yourName', lang) + ':', 'Marie Dupont') || 'Marie Dupont';
    login(name, false);
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: 320, textAlign: 'center' }}>
        {/* Tagline */}
        <div style={{ fontSize: '0.56rem', letterSpacing: '0.3em', color: 'rgba(0,255,209,0.6)' }}>
          {t('landingTagline', lang)}
        </div>

        {/* Typewriter */}
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 'clamp(0.95rem,3.5vw,1.9rem)',
            color: '#EFF6FF',
            height: '2.2em',
            lineHeight: '2.2em',
            overflow: 'hidden',
            width: 260,
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
              whiteSpace: 'nowrap',
              borderRight: '2px solid #00FFD1',
              animation: 'blink 1s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingRight: 2,
            }}
          >
            {phrases[twI]?.slice(0, twC) || ''}
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.4)', lineHeight: 1.85, width: 240, flexShrink: 0 }}>
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
                {f.icon} {t(f.titleKey, lang)} {f.premium && '✦'}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.4)', lineHeight: 1.5 }}>
                {t(f.descKey, lang)}
              </div>
            </div>
          ))}
        </div>

        {/* Premium Note */}
        <div style={{ fontSize: '0.55rem', color: 'rgba(255,179,71,0.5)', letterSpacing: '0.08em' }}>
          {t('premiumNote', lang)}
        </div>

        <section style={{ width: 'min(320px,90vw)', padding: '.85rem', borderRadius: 12, textAlign: 'left', background: 'linear-gradient(135deg,rgba(255,179,71,.08),rgba(192,132,252,.055))', border: '1px solid rgba(255,179,71,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.7rem', marginBottom: '.55rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: '#FFB347', fontSize: '.65rem', letterSpacing: '.11em' }}><Crown size={16} /> {t('premiumLandingTitle', lang)}</span>
            <strong style={{ color: '#EFF6FF', fontSize: '.8rem' }}>$10</strong>
          </div>
          <p style={{ margin: '0 0 .65rem', color: 'rgba(239,246,255,.46)', fontSize: '.56rem', lineHeight: 1.6 }}>{t('premiumLandingDesc', lang)}</p>
          <div style={{ display: 'grid', gap: '.35rem' }}>
            {['f2', 'f3', 'f4', 'f6', 'f8'].map(key => (
              <span key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '.4rem', color: 'rgba(239,246,255,.64)', fontSize: '.55rem', lineHeight: 1.45 }}>
                <Check size={12} color="#00FFD1" style={{ flexShrink: 0, marginTop: 1 }} /> {t(key, lang)}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '.65rem', paddingTop: '.55rem', borderTop: '1px solid rgba(255,179,71,.14)', color: 'rgba(255,179,71,.65)', fontSize: '.51rem', lineHeight: 1.5 }}>{t('premiumLifetimeClarification', lang)}</div>
        </section>

        <div style={{ width: 'min(260px,80vw)', display: 'flex', flexDirection: 'column', gap: '0.55rem', flexShrink: 0 }}>
          {/* Google Login Button */}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.82rem 1rem',
              background: '#fff',
              border: '1px solid #fff',
              borderRadius: 10,
              color: '#2d2d2d',
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.75rem',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{t('googleLogin', lang)}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(239,246,255,0.24)', fontSize: '0.52rem' }}>
            <span style={{ height: 1, flex: 1, background: 'rgba(239,246,255,0.12)' }} />
            <span>{t('orLabel', lang)}</span>
            <span style={{ height: 1, flex: 1, background: 'rgba(239,246,255,0.12)' }} />
          </div>

          {/* Guest Access */}
          <button
            onClick={handleGuestLogin}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(0,255,209,0.025)',
              border: '1px solid rgba(0,255,209,0.25)',
              color: 'rgba(239,246,255,0.72)',
              fontFamily: "'DM Mono',monospace",
              fontSize: '0.7rem',
              cursor: 'pointer',
              borderRadius: 10,
            }}
          >
            {t('guestLogin', lang)}
          </button>
        </div>

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
          {t('landingFooter', lang)}
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '.5rem', paddingBottom: '.75rem' }}>
          <a href="/legal/privacy.html" style={{ color: 'rgba(239,246,255,.38)' }}>Confidentialité</a>
          <a href="/legal/terms.html" style={{ color: 'rgba(239,246,255,.38)' }}>Conditions</a>
          <a href="/legal/cookies.html" style={{ color: 'rgba(239,246,255,.38)' }}>Cookies</a>
          <a href="/legal/data-deletion.html" style={{ color: 'rgba(239,246,255,.38)' }}>Suppression</a>
        </div>
      </div>
    </div>
  );
}
