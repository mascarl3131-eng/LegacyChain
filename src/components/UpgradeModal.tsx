import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

const FEATS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

export default function UpgradeModal() {
  const {
    upgradeOpen,
    setUpgradeOpen,
    lang,
    purchasePremium,
    premiumCheckoutLoading,
    premiumCheckoutError,
    session,
    loginWithGoogle,
  } = useStore();

  if (!upgradeOpen) return null;

  return (
    <div
      onClick={() => setUpgradeOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(4,3,10,0.88)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0c0a1c',
          border: '1px solid rgba(255,179,71,0.25)',
          borderRadius: '18px 18px 0 0',
          padding: '1.5rem 1.2rem',
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: 36, height: 3, background: 'rgba(239,246,255,0.15)', borderRadius: 2, margin: '0 auto 1rem' }} />
        <button onClick={() => setUpgradeOpen(false)} style={{ position: 'absolute', top: '0.9rem', right: '1rem', background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.32)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        <h3 className="font-display" style={{ color: '#FFB347', fontSize: '0.9rem', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>{t('upgradeTitle', lang)}</h3>
        <p style={{ fontSize: '0.72rem', color: 'rgba(224,235,255,0.86)', marginBottom: '1.2rem', lineHeight: 1.7 }}>{t('upgradeDesc', lang)}</p>
        <div style={{ fontSize: '2.2rem', color: '#EFF6FF', fontWeight: 500, margin: '0.8rem 0' }}>
          €9.99 <span style={{ fontSize: '0.72rem', color: 'rgba(224,235,255,0.82)' }}>{t('once', lang)}</span>
        </div>
        <div style={{ textAlign: 'left', margin: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {FEATS.map(f => (
            <div key={f} style={{ fontSize: '0.72rem', color: 'rgba(224,235,255,0.9)', padding: '0.22rem 0', borderBottom: '1px solid rgba(0,255,209,0.13)', display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
              <span style={{ color: '#FFB347', fontSize: '0.52rem', flexShrink: 0 }}>✦</span>
              {t(f, lang)}
            </div>
          ))}
        </div>
        {session ? (
          <button
            type="button"
            onClick={purchasePremium}
            disabled={premiumCheckoutLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg,rgba(255,179,71,0.16),rgba(192,132,252,0.16))',
              border: '1px solid #FFB347',
              color: '#FFB347',
              fontFamily: "var(--body-font)",
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              borderRadius: 10,
              cursor: premiumCheckoutLoading ? 'wait' : 'pointer',
              opacity: premiumCheckoutLoading ? 0.65 : 1,
              marginTop: '0.85rem',
            }}
          >
            {premiumCheckoutLoading ? t('checkoutStarting', lang) : t('unlockBtn', lang)}
          </button>
        ) : (
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ padding: '0.7rem 0.8rem', borderRadius: 8, background: 'rgba(255,179,71,0.06)', border: '1px solid rgba(255,179,71,0.22)', color: 'rgba(224,235,255,0.84)', fontSize: '0.62rem', lineHeight: 1.55, marginBottom: '0.55rem' }}>
              {t('premiumNeedsAccount', lang)}
            </div>
            <div>
              <button type="button" onClick={() => void loginWithGoogle()} style={{ width: '100%', padding: '0.75rem 0.5rem', borderRadius: 9, border: '1px solid #fff', background: '#fff', color: '#252525', fontFamily: "var(--body-font)", fontSize: '0.64rem', cursor: 'pointer' }}>
                G&nbsp; Google
              </button>
            </div>
          </div>
        )}
        {premiumCheckoutError && (
          <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.75rem', borderRadius: 7, border: '1px solid rgba(255,68,68,0.4)', background: 'rgba(255,68,68,0.08)', color: '#FF6B6B', fontSize: '0.62rem', lineHeight: 1.55, textAlign: 'center' }}>
            {premiumCheckoutError}
          </div>
        )}
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 9, border: '1px solid rgba(0,255,209,0.16)', background: 'rgba(0,255,209,0.035)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.42rem', color: '#00FFD1', fontSize: '0.6rem', letterSpacing: '0.12em', marginBottom: '0.55rem' }}>
            <ShieldCheck size={15} strokeWidth={1.8} />
            {t('securePayment', lang)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem 0.75rem', color: 'rgba(224,235,255,0.82)', fontSize: '0.55rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.28rem' }}>
              <LockKeyhole size={11} /> {t('encryptedCheckout', lang)}
            </span>
            <span>{t('poweredByStripe', lang)}</span>
          </div>
          <div style={{ color: 'rgba(224,235,255,0.72)', fontSize: '0.5rem', lineHeight: 1.5, textAlign: 'center', marginTop: '0.48rem' }}>
            {t('cardDataNotice', lang)}
          </div>
        </div>
      </div>
    </div>
  );
}
