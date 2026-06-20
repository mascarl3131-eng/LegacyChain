import { CalendarClock, LockKeyhole, X } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { LangCode } from '@/lib/i18n';

const DELAYS = [1, 5, 10, 18, 25];

export default function UnlockYearPicker({
  lang,
  value,
  onChange,
}: {
  lang: LangCode;
  value: string;
  onChange: (value: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(value) || 0;
  const yearsAway = selectedYear > currentYear ? selectedYear - currentYear : 0;

  return (
    <div style={{ padding: '0.8rem', borderRadius: 10, border: '1px solid rgba(0,255,209,0.16)', background: 'rgba(0,255,209,0.025)' }}>
      <button
        type="button"
        onClick={() => onChange('')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.6rem', padding: '0.65rem 0.75rem', borderRadius: 8,
          border: `1px solid ${!value ? '#00FFD1' : 'rgba(239,246,255,0.1)'}`,
          background: !value ? 'rgba(0,255,209,0.08)' : 'rgba(4,3,10,0.45)',
          color: !value ? '#00FFD1' : 'rgba(239,246,255,0.55)', cursor: 'pointer',
          fontFamily: "'DM Mono',monospace", fontSize: '0.64rem',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><X size={14} /> {t('noTimeLock', lang)}</span>
        {!value && <span>✓</span>}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.35rem', marginTop: '0.55rem' }}>
        {DELAYS.map(delay => {
          const year = currentYear + delay;
          const active = selectedYear === year;
          return (
            <button
              type="button"
              key={delay}
              onClick={() => onChange(String(year))}
              style={{
                padding: '0.55rem 0.15rem', borderRadius: 7,
                border: `1px solid ${active ? '#FFB347' : 'rgba(255,179,71,0.16)'}`,
                background: active ? 'rgba(255,179,71,0.12)' : 'rgba(255,179,71,0.025)',
                color: active ? '#FFB347' : 'rgba(239,246,255,0.48)',
                cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '0.56rem',
              }}
            >
              +{delay} {t('yearsShort', lang)}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '0.65rem' }}>
        <CalendarClock size={15} color="#C084FC" />
        <select
          className="form-select"
          value={value}
          onChange={event => onChange(event.target.value)}
          style={{ flex: 1, minHeight: 38 }}
        >
          <option value="">{t('chooseExactYear', lang)}</option>
          {Array.from({ length: 126 }, (_, index) => currentYear + 1 + index).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {selectedYear > currentYear && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.7rem', padding: '0.65rem', borderRadius: 7, background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.16)', color: 'rgba(239,246,255,0.66)', fontSize: '0.59rem', lineHeight: 1.5 }}>
          <LockKeyhole size={14} color="#C084FC" />
          {t('unlockSummary', lang).replace('{year}', String(selectedYear)).replace('{count}', String(yearsAway))}
        </div>
      )}
    </div>
  );
}
