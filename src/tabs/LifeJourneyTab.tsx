import { useEffect, useMemo, useState } from 'react';
import { Car, MapPin, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

type CityEntry = { id: string; city: string; country: string; from: string; to: string; note: string };
type CarEntry = { id: string; model: string; from: string; to: string; note: string };

const makeId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export default function LifeJourneyTab() {
  const { lang, user, familyName } = useStore();
  const storageKey = useMemo(() => `legacychain-life-journey-${user?.email || familyName}`, [familyName, user?.email]);
  const [mode, setMode] = useState<'cities' | 'cars'>('cities');
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [cars, setCars] = useState<CarEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setCities(Array.isArray(parsed.cities) ? parsed.cities : []);
      setCars(Array.isArray(parsed.cars) ? parsed.cars : []);
    } catch {
      setCities([]);
      setCars([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ cities, cars }));
  }, [cars, cities, storageKey]);

  const inputStyle = {
    width: '100%', padding: '.62rem', borderRadius: 9, border: '1px solid rgba(0,255,209,.14)',
    background: 'rgba(2,6,23,.6)', color: '#EFF6FF', fontFamily: "'DM Mono',monospace", fontSize: '.62rem',
  } as const;
  const cardStyle = { padding: '.75rem', borderRadius: 12, background: 'rgba(0,255,209,.025)', border: '1px solid rgba(0,255,209,.12)' } as const;

  return (
    <div>
      <div className="font-display" style={{ fontSize: '.95rem', color: '#00FFD1', letterSpacing: '.15em', marginBottom: '.3rem' }}>{t('lifeJourneyTitle', lang)}</div>
      <p style={{ color: 'rgba(239,246,255,.42)', fontSize: '.6rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{t('lifeJourneySubtitle', lang)}</p>

      <div className="glass-card" style={{ padding: '.55rem', marginBottom: '.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem' }}>
        <button type="button" className="btn-sec" onClick={() => setMode('cities')} style={{ borderColor: mode === 'cities' ? '#00FFD1' : undefined, color: mode === 'cities' ? '#00FFD1' : undefined }}>
          <MapPin size={14} /> {t('lifeCities', lang)}
        </button>
        <button type="button" className="btn-sec" onClick={() => setMode('cars')} style={{ borderColor: mode === 'cars' ? '#FFB347' : undefined, color: mode === 'cars' ? '#FFB347' : undefined }}>
          <Car size={14} /> {t('lifeCars', lang)}
        </button>
      </div>

      {mode === 'cities' ? (
        <section className="glass-card">
          <button type="button" className="btn" onClick={() => setCities(prev => [...prev, { id: makeId(), city: '', country: '', from: '', to: '', note: '' }])} style={{ width: '100%', marginBottom: '.8rem' }}>
            <Plus size={14} /> {t('addCity', lang)}
          </button>
          {cities.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(239,246,255,.28)', fontSize: '.6rem', padding: '1rem' }}>{t('emptyCities', lang)}</div>}
          <div style={{ display: 'grid', gap: '.7rem' }}>
            {cities.map(entry => (
              <article key={entry.id} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginBottom: '.45rem' }}>
                  <input style={inputStyle} placeholder={t('city', lang)} value={entry.city} onChange={event => setCities(prev => prev.map(item => item.id === entry.id ? { ...item, city: event.target.value } : item))} />
                  <input style={inputStyle} placeholder={t('countryLabel', lang)} value={entry.country} onChange={event => setCities(prev => prev.map(item => item.id === entry.id ? { ...item, country: event.target.value } : item))} />
                  <input style={inputStyle} placeholder={t('dateFrom', lang)} value={entry.from} onChange={event => setCities(prev => prev.map(item => item.id === entry.id ? { ...item, from: event.target.value } : item))} />
                  <input style={inputStyle} placeholder={t('dateTo', lang)} value={entry.to} onChange={event => setCities(prev => prev.map(item => item.id === entry.id ? { ...item, to: event.target.value } : item))} />
                </div>
                <input style={inputStyle} placeholder={t('memoryNote', lang)} value={entry.note} onChange={event => setCities(prev => prev.map(item => item.id === entry.id ? { ...item, note: event.target.value } : item))} />
                <button type="button" className="btn-sec" onClick={() => setCities(prev => prev.filter(item => item.id !== entry.id))} style={{ marginTop: '.5rem', color: '#FF6B9D' }}><Trash2 size={13} /></button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="glass-card">
          <button type="button" className="btn-amber" onClick={() => setCars(prev => [...prev, { id: makeId(), model: '', from: '', to: '', note: '' }])} style={{ width: '100%', marginBottom: '.8rem' }}>
            <Plus size={14} /> {t('addCar', lang)}
          </button>
          {cars.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(239,246,255,.28)', fontSize: '.6rem', padding: '1rem' }}>{t('emptyCars', lang)}</div>}
          <div style={{ display: 'grid', gap: '.7rem' }}>
            {cars.map(entry => (
              <article key={entry.id} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginBottom: '.45rem' }}>
                  <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder={t('carModel', lang)} value={entry.model} onChange={event => setCars(prev => prev.map(item => item.id === entry.id ? { ...item, model: event.target.value } : item))} />
                  <input style={inputStyle} placeholder={t('dateFrom', lang)} value={entry.from} onChange={event => setCars(prev => prev.map(item => item.id === entry.id ? { ...item, from: event.target.value } : item))} />
                  <input style={inputStyle} placeholder={t('dateTo', lang)} value={entry.to} onChange={event => setCars(prev => prev.map(item => item.id === entry.id ? { ...item, to: event.target.value } : item))} />
                </div>
                <input style={inputStyle} placeholder={t('memoryNote', lang)} value={entry.note} onChange={event => setCars(prev => prev.map(item => item.id === entry.id ? { ...item, note: event.target.value } : item))} />
                <button type="button" className="btn-sec" onClick={() => setCars(prev => prev.filter(item => item.id !== entry.id))} style={{ marginTop: '.5rem', color: '#FF6B9D' }}><Trash2 size={13} /></button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
