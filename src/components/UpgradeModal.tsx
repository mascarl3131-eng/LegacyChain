import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const FEATS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'];

export default function UpgradeModal() {
  const { upgradeOpen, setUpgradeOpen, lang, setPremium, showNotif } = useStore();

  if (!upgradeOpen) return null;

  const handleUpgrade = () => {
    setUpgradeOpen(false);
    setPremium(true);
    showNotif('✦ Founding Voice unlocked!', '#FFB347');
  };

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
        <h3 className="font-display" style={{ color: '#FFB347', fontSize: '0.9rem', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>✦ FOUNDING VOICE</h3>
        <p style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.42)', marginBottom: '1.2rem', lineHeight: 1.7 }}>{t('upgradeDesc', lang)}</p>
        <div style={{ fontSize: '2.2rem', color: '#EFF6FF', fontWeight: 500, margin: '0.8rem 0' }}>
          $10 <span style={{ fontSize: '0.72rem', color: 'rgba(239,246,255,0.32)' }}>{t('once', lang)}</span>
        </div>
        <div style={{ textAlign: 'left', margin: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {FEATS.map(f => (
            <div key={f} style={{ fontSize: '0.72rem', color: 'rgba(239,246,255,0.62)', padding: '0.22rem 0', borderBottom: '1px solid rgba(0,255,209,0.13)', display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
              <span style={{ color: '#FFB347', fontSize: '0.52rem', flexShrink: 0 }}>✦</span>
              {t(f, lang)}
            </div>
          ))}
        </div>
        <button
          onClick={handleUpgrade}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'linear-gradient(135deg,rgba(255,179,71,0.16),rgba(192,132,252,0.16))',
            border: '1px solid #FFB347',
            color: '#FFB347',
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.8rem',
            letterSpacing: '0.18em',
            borderRadius: 10,
            cursor: 'pointer',
            marginTop: '0.85rem',
          }}
        >
          {t('unlockBtn', lang)}
        </button>
        <div style={{ fontSize: '0.56rem', color: 'rgba(239,246,255,0.16)', textAlign: 'center', marginTop: '0.6rem' }}>Powered by Stripe · Secure one-time payment</div>
      </div>
    </div>
  );
}
