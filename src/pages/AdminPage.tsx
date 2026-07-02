import { useEffect, useState } from 'react';
import { BarChart3, Crown, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const ADMIN_EMAILS = new Set(['mascarl3131@gmail.com']);

export default function AdminPage() {
  const { setPage, msgs, hMsgs, premium, premiumPreview, setPremiumPreview, session, lang, loginWithGoogle } = useStore();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [visitStats, setVisitStats] = useState<{
    total: number;
    last24h: number;
    last30d: number;
    uniqueLast30d: number;
    bySource: Record<string, number>;
    byPath: Record<string, number>;
    byCountry: Record<string, number>;
  } | null>(null);
  const [statsError, setStatsError] = useState('');

  const togglePremiumPreview = async () => {
    setPreviewLoading(true);
    setPreviewError('');
    const ok = await setPremiumPreview(!premiumPreview);
    if (!ok) setPreviewError(t('godModeUnauthorized', lang));
    setPreviewLoading(false);
  };

  const isAdmin = Boolean(session?.user.email && ADMIN_EMAILS.has(session.user.email.toLowerCase()));

  useEffect(() => {
    if (!session?.access_token || !isAdmin) return;
    fetch('/api/visit-stats', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Stats unavailable');
        setVisitStats(data);
      })
      .catch(error => setStatsError(error instanceof Error ? error.message : 'Stats unavailable'));
  }, [isAdmin, session?.access_token]);

  const topEntries = (rows: Record<string, number> = {}) => Object.entries(rows).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(4,3,10,0.98)', overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="font-display" style={{ color: '#00FFD1', fontSize: '0.9rem', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>⬡ {t('adminPanel', lang)}</div>

        {!session && (
          <section className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(255,179,71,.28)' }}>
            <div style={{ color: '#FFB347', fontSize: '.7rem', letterSpacing: '.12em', marginBottom: '.5rem' }}>{t('godModeLoginRequired', lang)}</div>
            <button type="button" className="btn-primary" onClick={() => void loginWithGoogle()}>{t('googleLogin', lang)}</button>
          </section>
        )}

        {session && !isAdmin && (
          <section className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(255,107,107,.28)' }}>
            <div style={{ color: '#FF6B6B', fontSize: '.7rem', letterSpacing: '.12em', marginBottom: '.45rem' }}>{t('godModeUnauthorized', lang)}</div>
            <div style={{ color: 'rgba(239,246,255,.42)', fontSize: '.58rem', lineHeight: 1.6, marginBottom: '.75rem' }}>{session.user.email}</div>
            <button type="button" className="btn-sec" onClick={() => setPage('app')}>{t('close', lang)}</button>
          </section>
        )}

        {isAdmin && (
          <>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#00FFD1' }}>{hMsgs.length}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>{t('voices', lang).toUpperCase()}</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#FFB347' }}>{msgs.length}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>{t('familyMessages', lang)}</div>
          </div>
          <div className="glass-card" style={{ textAlign: 'center', padding: '0.9rem' }}>
            <div style={{ fontSize: '1.3rem', color: '#C084FC' }}>{premium ? 1 : 0}</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>PREMIUM</div>
          </div>
        </div>

        <section className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(255,179,71,.3)', background: 'linear-gradient(135deg,rgba(255,179,71,.07),rgba(192,132,252,.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', color: '#FFB347', background: 'rgba(255,179,71,.1)', border: '1px solid rgba(255,179,71,.25)' }}><Crown size={18} /></span>
            <div>
              <div style={{ color: '#FFB347', fontSize: '.68rem', letterSpacing: '.12em' }}>{t('godModeTitle', lang)}</div>
              <div style={{ color: 'rgba(239,246,255,.38)', fontSize: '.53rem', marginTop: '.2rem' }}>{t('godModeDesc', lang)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: session ? '#00FFD1' : '#FF6B6B', fontSize: '.52rem', marginBottom: '.7rem' }}>
            <ShieldCheck size={13} /> {session ? session.user.email : t('godModeLoginRequired', lang)}
          </div>
          <button className={premiumPreview ? 'btn-sec' : 'btn-amber'} onClick={() => void togglePremiumPreview()} disabled={previewLoading || !session} style={{ width: '100%' }}>
            {previewLoading ? t('sending', lang) : premiumPreview ? t('godModeDisable', lang) : t('godModeEnable', lang)}
          </button>
          {premiumPreview && <div style={{ color: '#FFB347', fontSize: '.54rem', textAlign: 'center', marginTop: '.55rem' }}>{t('godModeActive', lang)}</div>}
          {previewError && <div style={{ color: '#FF6B6B', fontSize: '.54rem', marginTop: '.55rem' }}>{previewError}</div>}
        </section>

        <section className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', marginBottom: '.85rem' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', color: '#00FFD1', background: 'rgba(0,255,209,.08)', border: '1px solid rgba(0,255,209,.2)' }}><BarChart3 size={18} /></span>
            <div>
              <div style={{ color: '#00FFD1', fontSize: '.68rem', letterSpacing: '.12em' }}>VISITES</div>
              <div style={{ color: 'rgba(239,246,255,.38)', fontSize: '.53rem', marginTop: '.2rem' }}>Compteur Supabase gratuit</div>
            </div>
          </div>
          {visitStats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.45rem', marginBottom: '.85rem' }}>
                {[
                  [visitStats.total, 'TOTAL', '#00FFD1'],
                  [visitStats.last24h, '24H', '#FFB347'],
                  [visitStats.last30d, '30J', '#C084FC'],
                  [visitStats.uniqueLast30d, 'UNIQUES', '#7DD3FC'],
                ].map(([value, label, color]) => (
                  <div key={String(label)} style={{ textAlign: 'center', padding: '.55rem .35rem', borderRadius: 8, border: '1px solid rgba(239,246,255,.08)', background: 'rgba(239,246,255,.025)' }}>
                    <strong style={{ display: 'block', color: String(color), fontSize: '.9rem' }}>{value}</strong>
                    <span style={{ color: 'rgba(239,246,255,.36)', fontSize: '.46rem' }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gap: '.55rem' }}>
                {([
                  ['Sources', visitStats.bySource],
                  ['Pages', visitStats.byPath],
                  ['Pays', visitStats.byCountry],
                ] as [string, Record<string, number>][]).map(([label, rows]) => (
                  <div key={String(label)}>
                    <div style={{ color: 'rgba(239,246,255,.42)', fontSize: '.52rem', letterSpacing: '.1em', marginBottom: '.28rem' }}>{label}</div>
                    {topEntries(rows).length ? topEntries(rows).map(([key, count]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem', color: 'rgba(239,246,255,.72)', fontSize: '.58rem', padding: '.2rem 0', borderBottom: '1px solid rgba(239,246,255,.06)' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{key}</span>
                        <strong style={{ color: '#00FFD1' }}>{count}</strong>
                      </div>
                    )) : <div style={{ color: 'rgba(239,246,255,.28)', fontSize: '.56rem' }}>Aucune donnée</div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: statsError ? '#FF6B6B' : 'rgba(239,246,255,.42)', fontSize: '.6rem' }}>{statsError || 'Chargement des visites...'}</div>
          )}
        </section>

        <div style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#00FFD1', marginBottom: '0.9rem' }}>{t('pendingReview', lang)}</div>

        {hMsgs.slice(0, 3).map((m, i) => (
          <div key={i} className="glass-card" style={{ marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#00FFD1' }}>{m.a}</span>
              <span style={{ fontSize: '0.55rem', background: 'rgba(0,255,209,0.1)', color: '#00FFD1', padding: '0.1rem 0.4rem', borderRadius: 3 }}>{t('score', lang)}: {(m.id.length * 7 + i * 3) % 18}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(239,246,255,0.75)', marginBottom: '0.65rem' }}>{m.text}</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button style={{ flex: 1, padding: '0.45rem', background: 'rgba(0,255,209,0.07)', border: '1px solid rgba(0,255,209,0.18)', color: '#00FFD1', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', borderRadius: 6, cursor: 'pointer' }}>✅ {t('approve', lang)}</button>
              <button style={{ flex: 1, padding: '0.45rem', background: 'rgba(255,45,85,0.07)', border: '1px solid rgba(255,45,85,0.18)', color: '#FF2D55', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', borderRadius: 6, cursor: 'pointer' }}>❌ {t('delete', lang)}</button>
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
          {t('close', lang)}
        </button>
          </>
        )}
      </div>
    </div>
  );
}
