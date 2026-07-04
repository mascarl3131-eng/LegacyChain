import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, UsersRound } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { CHART_COLORS, DNA_SERVICES } from '@/lib/data';
import DnaImportPanel from '@/components/DnaImportPanel';
import DnaWorldMap from '@/components/DnaWorldMap';
import DnaQuickGuide from '@/components/DnaQuickGuide';
import { getCountryOptions } from '@/lib/countries';

type DnaMatch = {
  id: string;
  name: string;
  sharedPercent: string;
  sharedCm: string;
  relationship: string;
  side: string;
  status: string;
  contact: string;
  note: string;
};

const createDnaMatch = (): DnaMatch => ({
  id: crypto.randomUUID(),
  name: '',
  sharedPercent: '',
  sharedCm: '',
  relationship: '',
  side: '',
  status: 'toContact',
  contact: '',
  note: '',
});

function estimateRelationship(sharedPercent: number, lang: string) {
  const labels = {
    parentSibling: lang === 'fr' ? 'Parent/enfant, frère/sœur possible' : 'Parent/child or sibling possible',
    grandAuntHalf: lang === 'fr' ? 'Grand-parent, oncle/tante, demi-frère/sœur' : 'Grandparent, aunt/uncle, half sibling',
    firstCousin: lang === 'fr' ? 'Cousin germain possible' : 'Possible first cousin',
    secondCousin: lang === 'fr' ? 'Cousin issu de germain possible' : 'Possible second cousin',
    distant: lang === 'fr' ? 'Cousin éloigné possible' : 'Possible distant cousin',
    trace: lang === 'fr' ? 'Trace ADN faible' : 'Low DNA trace',
  };
  if (sharedPercent >= 17) return labels.parentSibling;
  if (sharedPercent >= 8) return labels.grandAuntHalf;
  if (sharedPercent >= 3) return labels.firstCousin;
  if (sharedPercent >= 1) return labels.secondCousin;
  if (sharedPercent > 0) return labels.distant;
  return labels.trace;
}

export default function OriginsTab() {
  const { lang, user, originRows, setOriginRows, pacte, setPacte, showNotif } = useStore();
  const countryOptions = getCountryOptions(lang);
  const dnaMatchStorageKey = useMemo(() => `legacychain-dna-matches-${user?.email || 'guest'}`, [user?.email]);
  const [dnaMatches, setDnaMatches] = useState<DnaMatch[]>([]);

  const total = originRows.reduce((s, r) => s + r.p, 0);
  const totalStatus = total === 100 ? 'ok' : total < 100 ? 'low' : 'over';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(dnaMatchStorageKey);
      setDnaMatches(saved ? JSON.parse(saved) : []);
    } catch {
      setDnaMatches([]);
    }
  }, [dnaMatchStorageKey]);

  useEffect(() => {
    localStorage.setItem(dnaMatchStorageKey, JSON.stringify(dnaMatches));
  }, [dnaMatchStorageKey, dnaMatches]);

  const addRow = () => setOriginRows([...originRows, { c: '', p: 0 }]);
  const updateRow = (i: number, field: 'c' | 'p', val: string) => {
    const updated = [...originRows];
    updated[i] = { ...updated[i], [field]: field === 'p' ? parseInt(val) || 0 : val };
    setOriginRows(updated);
  };
  const removeRow = (i: number) => setOriginRows(originRows.filter((_, j) => j !== i));
  const addDnaMatch = () => setDnaMatches(items => [createDnaMatch(), ...items]);
  const removeDnaMatch = (id: string) => setDnaMatches(items => items.filter(item => item.id !== id));
  const updateDnaMatch = (id: string, patch: Partial<DnaMatch>) => setDnaMatches(items => items.map(item => {
    if (item.id !== id) return item;
    const next = { ...item, ...patch };
    const percent = Number(next.sharedPercent.replace(',', '.')) || (Number(next.sharedCm) ? Number(next.sharedCm) / 68 : 0);
    if ((patch.sharedPercent !== undefined || patch.sharedCm !== undefined) && !next.relationship.trim()) {
      next.relationship = estimateRelationship(percent, lang);
    }
    return next;
  }));

  const signPacte = () => {
    if (pacte) return;
    setPacte(true);
    showNotif(t('guardianSuccess', lang), '#00FFD1');
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('originsTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('originsSub', lang)}</div>

      <div style={{ border: '1px solid rgba(255,179,71,0.32)', background: 'rgba(255,179,71,0.05)', borderRadius: 8, padding: '0.9rem', marginBottom: '1.3rem', fontSize: '0.7rem', lineHeight: 1.7, color: 'rgba(255,179,71,0.72)' }}>
        <strong style={{ color: '#FFB347', display: 'block', marginBottom: '0.22rem' }}>{t('dnaWarnTitle', lang)}</strong>
        <span>{t('dnaWarnText', lang)}</span>
      </div>

      <DnaQuickGuide lang={lang} />

      <DnaImportPanel
        lang={lang}
        onApply={rows => {
          setOriginRows(rows);
          showNotif(t('dnaResultsApplied', lang), '#00FFD1');
        }}
      />

      <section style={{ background: 'rgba(0,255,209,0.03)', border: '1px solid rgba(0,255,209,0.12)', borderRadius: 10, padding: '1rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.8rem', marginBottom: '.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: '#00FFD1', fontSize: '.66rem', letterSpacing: '.12em' }}><UsersRound size={16} /> {t('dnaMatchesTitle', lang)}</div>
            <div style={{ color: 'rgba(239,246,255,.38)', fontSize: '.55rem', lineHeight: 1.55, marginTop: '.28rem' }}>{t('dnaMatchesDesc', lang)}</div>
          </div>
          <button className="btn-sec" onClick={addDnaMatch} style={{ fontSize: '.58rem', whiteSpace: 'nowrap' }}>{t('addDnaMatch', lang)}</button>
        </div>
        <div style={{ color: 'rgba(255,179,71,.68)', fontSize: '.52rem', lineHeight: 1.55, marginBottom: '.75rem', borderTop: '1px solid rgba(255,179,71,.1)', paddingTop: '.55rem' }}>
          {t('dnaMatchesPrivacy', lang)}
        </div>
        {dnaMatches.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'rgba(239,246,255,.34)', fontSize: '.6rem', padding: '.65rem 0' }}><Search size={14} /> {t('emptyDnaMatches', lang)}</div>
        ) : (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {dnaMatches.map(match => (
              <div key={match.id} style={{ border: '1px solid rgba(239,246,255,.08)', borderRadius: 8, padding: '.75rem', background: 'rgba(239,246,255,.025)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: '.45rem', marginBottom: '.45rem' }}>
                  <input className="form-input" value={match.name} onChange={event => updateDnaMatch(match.id, { name: event.target.value })} placeholder={t('dnaMatchName', lang)} />
                  <input className="form-input" value={match.sharedPercent} onChange={event => updateDnaMatch(match.id, { sharedPercent: event.target.value })} placeholder={t('dnaSharedPercent', lang)} />
                  <input className="form-input" value={match.sharedCm} onChange={event => updateDnaMatch(match.id, { sharedCm: event.target.value })} placeholder={t('dnaSharedCm', lang)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(132px,1fr))', gap: '.45rem', marginBottom: '.45rem' }}>
                  <input className="form-input" value={match.relationship} onChange={event => updateDnaMatch(match.id, { relationship: event.target.value })} placeholder={t('dnaRelationshipHint', lang)} />
                  <input className="form-input" value={match.side} onChange={event => updateDnaMatch(match.id, { side: event.target.value })} placeholder={t('dnaFamilySide', lang)} />
                  <select className="form-select" value={match.status} onChange={event => updateDnaMatch(match.id, { status: event.target.value })}>
                    {['toContact', 'contacted', 'confirmed', 'ruledOut'].map(status => <option key={status} value={status}>{t(`dnaStatus_${status}`, lang)}</option>)}
                  </select>
                  <input className="form-input" value={match.contact} onChange={event => updateDnaMatch(match.id, { contact: event.target.value })} placeholder={t('dnaContactInfo', lang)} />
                </div>
                <textarea className="form-textarea" value={match.note} onChange={event => updateDnaMatch(match.id, { note: event.target.value })} placeholder={t('dnaMatchNote', lang)} style={{ minHeight: 76 }} />
                <button className="btn-sec" onClick={() => removeDnaMatch(match.id)} style={{ marginTop: '.45rem', color: '#FFB4B4', borderColor: 'rgba(255,107,107,.32)', display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}><Trash2 size={13} /> {t('deleteRecording', lang)}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {originRows.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.4rem' }}>
          <select className="form-select" style={{ flex: 1 }} value={row.c} onChange={e => updateRow(i, 'c', e.target.value)}>
            <option value="">{t('countryPlaceholder', lang)}</option>
            {countryOptions.map(country => (
              <option key={country.code} value={country.canonicalName}>{country.flag} {country.name}</option>
            ))}
          </select>
          <input type="number" className="form-input" style={{ width: 60 }} placeholder="%" value={row.p || ''} min={0} max={100} onChange={e => updateRow(i, 'p', e.target.value)} />
          <span style={{ color: '#00FFD1', fontSize: '0.78rem', flexShrink: 0 }}>%</span>
          <button onClick={() => removeRow(i)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,45,85,0.45)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
        </div>
      ))}

      <button className="btn-sec" style={{ marginTop: '0.4rem', fontSize: '0.62rem' }} onClick={addRow}>{t('addOrigin', lang)}</button>

      <div className={`t-${totalStatus}`} style={{
        marginTop: '0.8rem', padding: '0.6rem', borderRadius: 6, fontSize: '0.7rem', textAlign: 'center',
        background: totalStatus === 'ok' ? 'rgba(0,255,209,0.07)' : totalStatus === 'low' ? 'rgba(255,179,71,0.07)' : 'rgba(255,45,85,0.07)',
        border: `1px solid ${totalStatus === 'ok' ? 'rgba(0,255,209,0.18)' : totalStatus === 'low' ? 'rgba(255,179,71,0.18)' : 'rgba(255,45,85,0.18)'}`,
        color: totalStatus === 'ok' ? '#00FFD1' : totalStatus === 'low' ? '#FFB347' : '#FF2D55',
      }}>
        {totalStatus === 'ok' ? t('totalOk', lang) : totalStatus === 'low' ? `${t('totalLow', lang)} (${total}%)` : `${t('totalOver', lang)} (${total}%)`}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.6rem' }}>
          <div>
            <div style={{ color: '#00FFD1', fontSize: '0.66rem', letterSpacing: '0.12em' }}>{t('dnaMapTitle', lang)}</div>
            <div style={{ color: 'rgba(239,246,255,0.3)', fontSize: '0.54rem', marginTop: '0.2rem' }}>{t('dnaMapHint', lang)}</div>
          </div>
          <span style={{ color: 'rgba(255,179,71,0.5)', fontSize: '0.5rem', textAlign: 'right' }}>{t('notCertified', lang)}</span>
        </div>
        <DnaWorldMap origins={originRows} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {originRows.filter(o => o.p > 0 && o.c).map((o, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1rem', color: CHART_COLORS[i % CHART_COLORS.length] }}>{o.p}%</strong>
            <span style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.32)', letterSpacing: '0.08em' }}>{o.c}</span>
          </div>
        ))}
      </div>

      {/* DNA Services */}
      <div style={{ background: 'rgba(0,255,209,0.03)', border: '1px solid rgba(0,255,209,0.1)', borderRadius: 10, padding: '1rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,209,0.6)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>{t('discoverOrigins', lang)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {DNA_SERVICES.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '0.6rem 0.75rem', display: 'block', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,209,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <div style={{ fontSize: '0.62rem', color: '#EFF6FF', fontWeight: 500, marginBottom: '0.2rem' }}>{s.name}</div>
            </a>
          ))}
        </div>
        <div style={{ fontSize: '0.55rem', color: 'rgba(239,246,255,0.2)', textAlign: 'center', marginTop: '0.75rem', letterSpacing: '0.06em' }}>{t('dnaReliability', lang)}</div>
      </div>

      {/* Family Pact */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,255,209,0.04),rgba(192,132,252,0.04))', border: '1px solid rgba(0,255,209,0.16)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>{t('pacteTitle', lang)}</div>
        <p style={{ fontStyle: 'italic', fontSize: '0.78rem', lineHeight: 1.95, color: 'rgba(239,246,255,0.62)', marginBottom: '1.2rem' }}>
          {t('commitLegacy', lang)} {t('yourChildren', lang)} {t('age60', lang)}.
        </p>
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 Marie · 2024</span>
          <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 Robert · 2024</span>
          {pacte && user && (
            <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 {user.first} · {new Date().getFullYear()}</span>
          )}
        </div>
        <button className="btn-primary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={signPacte}>{t('signPacte', lang)}</button>
      </div>
    </div>
  );
}
