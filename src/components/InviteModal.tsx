import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function InviteModal() {
  const { inviteOpen, setInviteOpen, familyName, lang } = useStore();
  const link = `https://legacychain.app/?famille=${familyName}`;

  if (!inviteOpen) return null;

  return (
    <div
      onClick={() => setInviteOpen(false)}
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
          border: '1px solid rgba(0,255,209,0.13)',
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
        <button onClick={() => setInviteOpen(false)} style={{ position: 'absolute', top: '0.9rem', right: '1rem', background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.32)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        <h3 className="font-display" style={{ color: '#00FFD1', fontSize: '0.9rem', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>{t('inviteTitle', lang)}</h3>
        <p style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.42)', marginBottom: '1.2rem', lineHeight: 1.7 }}>{t('inviteDesc', lang)}</p>
        <div style={{ background: 'rgba(0,255,209,0.05)', border: '1px solid rgba(0,255,209,0.13)', borderRadius: 6, padding: '0.55rem 0.75rem', fontSize: '0.7rem', color: '#00FFD1', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</span>
          <button
            onClick={() => navigator.clipboard.writeText(link).catch(() => {})}
            className="btn-sec"
            style={{ flexShrink: 0, fontSize: '0.6rem', padding: '0.25rem 0.52rem' }}
          >
            {t('copy', lang)}
          </button>
        </div>
        <button
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join our family chain 👨‍👩‍👧‍👦 ${link}`)}`, '_blank')}
          style={{
            width: '100%',
            background: 'rgba(37,211,102,0.07)',
            border: '1px solid rgba(37,211,102,0.18)',
            color: '#25d366',
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.72rem',
            padding: '0.6rem',
            borderRadius: 8,
            cursor: 'pointer',
            marginBottom: '0.5rem',
          }}
        >
          📱 WhatsApp
        </button>
      </div>
    </div>
  );
}
