import { useEffect, useRef, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t, TYPEWRITER_PHRASES } from '@/lib/i18n';
import GetAppButton from '@/components/GetAppButton';

const FEATURES = [
  { icon: '🌍', titleKey: 'hvTitle', descKey: 'featureHumanityDesc', color: '#00FFD1' },
  { icon: '⬡', titleKey: 'chainTitle', descKey: 'featureChainDesc', color: '#00FFD1' },
  { icon: '🌳', titleKey: 'treeTitle', descKey: 'featureTreeDesc', color: '#00FFD1' },
  { icon: '🧬', titleKey: 'originsTitle', descKey: 'featureOriginsDesc', color: '#00FFD1', premium: true },
  { icon: '🎨', titleKey: 'navMural', descKey: 'featureMuralDesc', color: '#C084FC', premium: true },
  { icon: '🏆', titleKey: 'navChal', descKey: 'featureChallengesDesc', color: '#00FFD1' },
  { icon: '📖', titleKey: 'bookTitle', descKey: 'featureBookDesc', color: '#C084FC', premium: true },
  { icon: '🎙', titleKey: 'audioVideo', descKey: 'featureAudioDesc', color: '#FFB347', premium: true },
];

export default function LandingPage() {
  const { page, login, loginWithGoogle, lang, loading, theme, setTheme } = useStore();
  const [twI, setTwI] = useState(0);
  const [twC, setTwC] = useState(0);
  const [twDel, setTwDel] = useState(false);
  const [counters, setCounters] = useState({ fam: 0, msg: 0, cap: 0 });
  const typewriterRef = useRef<HTMLSpanElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (page !== 'landing') return;
    requestAnimationFrame(() => {
      landingRef.current?.scrollTo({ top: 0, left: 0 });
      window.scrollTo({ top: 0, left: 0 });
    });
  }, [page]);

  useEffect(() => {
    if (page !== 'landing' || loading) return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const renderGoogleButton = () => {
      const target = googleButtonRef.current;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!target || !clientId) return;
      if (!window.google?.accounts?.id) {
        attempts += 1;
        if (attempts < 20) timer = setTimeout(renderGoogleButton, 250);
        return;
      }

      target.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          void loginWithGoogle(credential);
        },
      });
      window.google.accounts.id.renderButton(target, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
      });
    };

    renderGoogleButton();
    return () => clearTimeout(timer);
  }, [page, loading, loginWithGoogle]);

  // Live landing counters
  useEffect(() => {
    if (page !== 'landing') return;

    let active = true;

    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin-premium-preview?action=landingStats');
        const data = await response.json().catch(() => ({}));
        if (!active || !response.ok) return;
        setCounters({
          fam: Number(data.families) || 0,
          msg: Number(data.messages) || 0,
          cap: Number(data.capsules) || 0,
        });
      } catch {
        // Keep the last visible numbers if stats are temporarily unavailable.
      }
    };

    void loadStats();
    const iv = window.setInterval(() => void loadStats(), 60000);

    return () => {
      active = false;
      window.clearInterval(iv);
    };
  }, [page]);

  const handleGuestLogin = () => {
    const name = prompt(t('yourName', lang) + ':', 'Marie Dupont') || 'Marie Dupont';
    login(name, false);
  };

  if (page !== 'landing') return null;

  return (
    <div
      ref={landingRef}
      className="landing-page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: 'calc(2.75rem + env(safe-area-inset-top)) 1.5rem calc(1.25rem + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: 340, textAlign: 'center' }}>
        {/* Tagline */}
        <div style={{ fontSize: '0.56rem', letterSpacing: '0.3em', color: 'rgba(0,255,209,0.82)' }}>
          {t('landingTagline', lang)}
        </div>

        {/* Typewriter */}
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 'clamp(0.95rem,3.5vw,1.9rem)',
            color: 'var(--text)',
            height: '2.9em',
            lineHeight: 1.35,
            overflow: 'hidden',
            width: 'min(320px,90vw)',
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
              paddingRight: 2,
            }}
          >
            {phrases[twI]?.slice(0, twC) || ''}
          </span>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.85, width: 260, flexShrink: 0 }}>
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
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t(f.descKey, lang)}
              </div>
            </div>
          ))}
        </div>

        {/* Premium Note */}
        <div style={{ fontSize: '0.55rem', color: 'rgba(255,191,104,0.85)', letterSpacing: '0.08em' }}>
          {t('premiumNote', lang)}
        </div>

        <div
          style={{
            width: 'min(320px,90vw)',
            padding: '0.7rem 0.8rem',
            borderRadius: 10,
            border: '1px solid rgba(0,255,209,0.18)',
            background: 'rgba(0,255,209,0.04)',
            color: 'var(--text-muted)',
            fontSize: '0.58rem',
            lineHeight: 1.65,
            textAlign: 'left',
          }}
        >
          {t('sealedVisibilityNote', lang)}
        </div>

        <section style={{ width: 'min(320px,90vw)', padding: '.85rem', borderRadius: 12, textAlign: 'left', background: 'linear-gradient(135deg,rgba(255,179,71,.08),rgba(192,132,252,.055))', border: '1px solid rgba(255,179,71,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.7rem', marginBottom: '.55rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: '#FFB347', fontSize: '.65rem', letterSpacing: '.11em' }}><Crown size={16} /> {t('premiumLandingTitle', lang)}</span>
            <strong style={{ color: 'var(--text)', fontSize: '.8rem' }}>€10</strong>
          </div>
          <p style={{ margin: '0 0 .65rem', color: 'var(--text-muted)', fontSize: '.58rem', lineHeight: 1.65 }}>{t('premiumLandingDesc', lang)}</p>
          <div style={{ display: 'grid', gap: '.35rem' }}>
            {['f2', 'f3', 'fDna', 'f4', 'f8'].map(key => (
              <span key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '.4rem', color: 'var(--text-muted)', fontSize: '.56rem', lineHeight: 1.45 }}>
                <Check size={12} color="#00FFD1" style={{ flexShrink: 0, marginTop: 1 }} /> {t(key, lang)}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '.65rem', paddingTop: '.55rem', borderTop: '1px solid rgba(255,179,71,.14)', color: 'rgba(255,196,120,.86)', fontSize: '.52rem', lineHeight: 1.55 }}>{t('premiumLifetimeClarification', lang)}</div>
        </section>

        <div style={{ width: 'min(260px,80vw)', display: 'flex', flexDirection: 'column', gap: '0.55rem', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem' }}>
            {([
              ['heritage', 'Heritage', '#10130F', '#E6C36A'],
              ['paper', 'Papier', '#FFF8EA', '#2E261B'],
            ] as const).map(([id, label, bg, accent]) => {
              const active = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  style={{
                    minHeight: 46,
                    borderRadius: 10,
                    border: active ? '2px solid var(--menu-active)' : '1px solid var(--glass-border)',
                    background: active ? 'var(--menu-bg-soft)' : 'var(--glass)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontFamily: 'var(--body-font)',
                    fontSize: '.66rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '.4rem',
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: bg, border: `3px solid ${accent}`, boxShadow: '0 0 0 1px rgba(0,0,0,.18)' }} />
                  {label}
                </button>
              );
            })}
          </div>

          <GetAppButton />

          {/* Official Google button: authentication stays on accounts.google.com. */}
          <div
            ref={googleButtonRef}
            aria-label={t('googleLogin', lang)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-soft)', fontSize: '0.54rem' }}>
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
              color: 'var(--text)',
              fontFamily: "var(--body-font)",
              fontSize: '0.7rem',
              cursor: 'pointer',
              borderRadius: 10,
            }}
          >
            {t('guestLogin', lang)}
          </button>
        </div>

        {/* Counters */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>
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

        <div style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(0,255,209,0.56)', paddingBottom: '0.5rem' }}>
          {t('landingFooter', lang)}
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '.5rem', paddingBottom: '.75rem' }}>
          <a href="/legal/privacy.html" style={{ color: 'rgba(224,235,255,.8)' }}>{t('privacyPolicy', lang)}</a>
          <a href="/legal/terms.html" style={{ color: 'rgba(224,235,255,.8)' }}>{t('termsPolicy', lang)}</a>
          <a href="/legal/cookies.html" style={{ color: 'rgba(224,235,255,.8)' }}>{t('cookiesPolicy', lang)}</a>
          <a href="/legal/data-deletion.html" style={{ color: 'rgba(224,235,255,.8)' }}>{t('dataDeletionPolicy', lang)}</a>
        </div>
      </div>
    </div>
  );
}
