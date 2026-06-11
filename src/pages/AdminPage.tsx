import { useStore } from '@/lib/store';

export default function AdminPage() {
  const { setPage, msgs, hMsgs, premium } = useStore();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(4,3,10,0.98)', overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="font-display" style={{ color: '#00FFD1', fontSize: '0.9rem', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>⬡ ADMIN PANEL</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#00FFD1' }}>{hMsgs.length}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>VOICES</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#FFB347' }}>{msgs.length}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>FAMILY MSGS</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#C084FC' }}>{premium ? 1 : 0}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>PREMIUM</div>
          </div>
        </div>

        <div style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#00FFD1', marginBottom: '0.9rem' }}>MESSAGES PENDING REVIEW</div>

        {hMsgs.slice(0, 3).map((m, i) => (
          <div key={i} className="glass-card" style={{ marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#00FFD1' }}>{m.a}</span>
              <span style={{ fontSize: '0.55rem', background: 'rgba(0,255,209,0.1)', color: '#00FFD1', padding: '0.1rem 0.4rem', borderRadius: 3 }}>SCORE: {Math.floor(Math.random() * 18)}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(239,246,255,0.75)', marginBottom: '0.65rem' }}>{m.text}</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button style={{ flex: 1, padding: '0.45rem', background: 'rgba(0,255,209,0.07)', border: '1px solid rgba(0,255,209,0.18)', color: '#00FFD1', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', borderRadius: 6, cursor: 'pointer' }}>✅ APPROVE</button>
              <button style={{ flex: 1, padding: '0.45rem', background: 'rgba(255,45,85,0.07)', border: '1px solid rgba(255,45,85,0.18)', color: '#FF2D55', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', borderRadius: 6, cursor: 'pointer' }}>❌ DELETE</button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setPage('app')}
          style={{
            width: '100%', padding: '0.7rem', background: 'transparent', border: '1px solid rgba(0,255,209,0.13)',
            color: 'rgba(239,246,255,0.38)', fontFamily: "'DM Mono',monospace", fontSize: '0.72rem',
            borderRadius: 8, cursor: 'pointer', letterSpacing: '0.1em', marginTop: '1rem',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
