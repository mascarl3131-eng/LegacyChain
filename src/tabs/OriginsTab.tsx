import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { CHART_COLORS, DNA_SERVICES } from '@/lib/data';
import DnaImportPanel from '@/components/DnaImportPanel';
import DnaWorldMap from '@/components/DnaWorldMap';
import DnaQuickGuide from '@/components/DnaQuickGuide';
import { getCountryOptions } from '@/lib/countries';

export default function OriginsTab() {
  const { lang, user, originRows, setOriginRows, pacte, setPacte, showNotif } = useStore();
  const countryOptions = getCountryOptions(lang);

  const total = originRows.reduce((s, r) => s + r.p, 0);
  const totalStatus = total === 100 ? 'ok' : total < 100 ? 'low' : 'over';

  const addRow = () => setOriginRows([...originRows, { c: '', p: 0 }]);
  const updateRow = (i: number, field: 'c' | 'p', val: string) => {
    const updated = [...originRows];
    updated[i] = { ...updated[i], [field]: field === 'p' ? parseInt(val) || 0 : val };
    setOriginRows(updated);
  };
  const removeRow = (i: number) => setOriginRows(originRows.filter((_, j) => j !== i));

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
