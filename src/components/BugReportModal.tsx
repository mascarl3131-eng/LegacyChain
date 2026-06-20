import { useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const CATEGORIES = ['display', 'login', 'payment', 'data', 'performance', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'blocking'];

export default function BugReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, tab, session, user } = useStore();
  const [category, setCategory] = useState('display');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setError('');
      setSent(false);
      setDescription('');
    }, 200);
  };

  const submit = async () => {
    setError('');
    if (description.trim().length < 10) return setError(t('bugDescriptionTooShort', lang));
    setSubmitting(true);
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          category,
          severity,
          description: description.trim(),
          contactEmail: contactEmail.trim(),
          page: tab,
          browser: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          language: lang,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('bugReportError', lang));
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('bugReportError', lang));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="bug-report-title" style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <button type="button" aria-label={t('close', lang)} onClick={close} style={{ position: 'absolute', inset: 0, width: '100%', border: 0, background: 'rgba(1,2,8,.82)', backdropFilter: 'blur(7px)' }} />
      <section className="glass-card" style={{ position: 'relative', zIndex: 1, width: 'min(100%,520px)', maxHeight: 'min(760px,92vh)', overflowY: 'auto', borderColor: 'rgba(0,255,209,.28)', boxShadow: '0 24px 80px rgba(0,0,0,.55)' }}>
        <button type="button" onClick={close} aria-label={t('close', lang)} style={{ position: 'absolute', right: 12, top: 12, border: 0, background: 'transparent', color: 'rgba(239,246,255,.45)', cursor: 'pointer' }}><X size={18} /></button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem .5rem' }}>
            <CheckCircle2 size={42} color="#00FFD1" style={{ margin: '0 auto .9rem' }} />
            <div className="font-display" style={{ color: '#00FFD1', letterSpacing: '.13em', fontSize: '.9rem' }}>{t('bugReportSent', lang)}</div>
            <p style={{ color: 'rgba(239,246,255,.48)', fontSize: '.65rem', lineHeight: 1.7 }}>{t('bugReportThanks', lang)}</p>
            <button className="btn-primary" onClick={close}>{t('close', lang)}</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', paddingRight: '2rem' }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#00FFD1', background: 'rgba(0,255,209,.08)', border: '1px solid rgba(0,255,209,.2)' }}><Bug size={19} /></span>
              <div>
                <div id="bug-report-title" className="font-display" style={{ color: '#EFF6FF', letterSpacing: '.12em', fontSize: '.83rem' }}>{t('reportBug', lang)}</div>
                <div style={{ color: 'rgba(239,246,255,.38)', fontSize: '.56rem', marginTop: '.25rem' }}>{t('bugReportSub', lang)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.55rem', marginTop: '1rem' }}>
              <label style={{ fontSize: '.55rem', color: 'rgba(239,246,255,.42)' }}>{t('bugCategory', lang)}
                <select className="form-select" value={category} onChange={event => setCategory(event.target.value)} style={{ marginTop: '.3rem' }}>
                  {CATEGORIES.map(item => <option key={item} value={item}>{t(`bugCategory${item[0].toUpperCase()}${item.slice(1)}`, lang)}</option>)}
                </select>
              </label>
              <label style={{ fontSize: '.55rem', color: 'rgba(239,246,255,.42)' }}>{t('bugSeverity', lang)}
                <select className="form-select" value={severity} onChange={event => setSeverity(event.target.value)} style={{ marginTop: '.3rem' }}>
                  {SEVERITIES.map(item => <option key={item} value={item}>{t(`bugSeverity${item[0].toUpperCase()}${item.slice(1)}`, lang)}</option>)}
                </select>
              </label>
            </div>

            <label style={{ display: 'block', fontSize: '.55rem', color: 'rgba(239,246,255,.42)', marginTop: '.7rem' }}>{t('bugDescription', lang)}
              <textarea className="form-textarea" value={description} maxLength={2000} onChange={event => setDescription(event.target.value)} placeholder={t('bugDescriptionPlaceholder', lang)} style={{ marginTop: '.3rem', minHeight: 130 }} />
            </label>
            <div style={{ textAlign: 'right', color: 'rgba(239,246,255,.24)', fontSize: '.5rem' }}>{description.length}/2000</div>

            <label style={{ display: 'block', fontSize: '.55rem', color: 'rgba(239,246,255,.42)', marginTop: '.5rem' }}>{t('bugContactEmail', lang)}
              <input className="form-input" type="email" value={contactEmail} onChange={event => setContactEmail(event.target.value)} placeholder={t('optional', lang)} style={{ marginTop: '.3rem' }} />
            </label>
            <input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />

            <div style={{ display: 'flex', gap: '.45rem', alignItems: 'flex-start', margin: '.75rem 0', padding: '.65rem', borderRadius: 8, background: 'rgba(255,179,71,.05)', border: '1px solid rgba(255,179,71,.16)' }}>
              <AlertTriangle size={14} color="#FFB347" style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(239,246,255,.4)', fontSize: '.52rem', lineHeight: 1.55 }}>{t('bugTechnicalInfo', lang)}</span>
            </div>

            {error && <div style={{ color: '#FF6B6B', fontSize: '.57rem', marginBottom: '.55rem' }}>{error}</div>}
            <button className="btn-primary" disabled={submitting} onClick={() => void submit()}>{submitting ? t('sending', lang) : t('sendBugReport', lang)}</button>
          </>
        )}
      </section>
    </div>
  );
}
