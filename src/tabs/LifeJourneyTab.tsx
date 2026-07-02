import { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, Car, Globe2, GraduationCap, Landmark, MapPin, Music, Plus, Star, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

type JourneySection = 'cities' | 'cars' | 'schools' | 'jobs' | 'countries' | 'stars' | 'traditions' | 'music';
type JourneyItem = { id: string; section: JourneySection; title: string; place: string; from: string; to: string; note: string };
type LegacyCityEntry = { id: string; city: string; country: string; from: string; to: string; note: string };
type LegacyCarEntry = { id: string; model: string; from: string; to: string; note: string };

const makeId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const SECTION_CONFIG: Record<JourneySection, { icon: typeof MapPin; labelKey: string; addKey: string; emptyKey: string; titleKey: string; placeKey: string; accent: string }> = {
  cities: { icon: MapPin, labelKey: 'lifeCities', addKey: 'addCity', emptyKey: 'emptyCities', titleKey: 'city', placeKey: 'countryLabel', accent: '#00FFD1' },
  cars: { icon: Car, labelKey: 'lifeCars', addKey: 'addCar', emptyKey: 'emptyCars', titleKey: 'carModel', placeKey: 'journeyPlaceOptional', accent: '#FFB347' },
  schools: { icon: GraduationCap, labelKey: 'lifeSchools', addKey: 'addSchool', emptyKey: 'emptySchools', titleKey: 'schoolName', placeKey: 'journeyPlace', accent: '#8B5CF6' },
  jobs: { icon: Briefcase, labelKey: 'lifeJobs', addKey: 'addJob', emptyKey: 'emptyJobs', titleKey: 'jobTitle', placeKey: 'companyName', accent: '#38BDF8' },
  countries: { icon: Globe2, labelKey: 'lifeVisitedCountries', addKey: 'addVisitedCountry', emptyKey: 'emptyVisitedCountries', titleKey: 'countryVisited', placeKey: 'journeyContext', accent: '#34D399' },
  stars: { icon: Star, labelKey: 'lifeStarsMet', addKey: 'addStarMet', emptyKey: 'emptyStarsMet', titleKey: 'starName', placeKey: 'meetingPlace', accent: '#FACC15' },
  traditions: { icon: Landmark, labelKey: 'lifeTraditions', addKey: 'addTradition', emptyKey: 'emptyTraditions', titleKey: 'traditionName', placeKey: 'familyBranch', accent: '#FB7185' },
  music: { icon: Music, labelKey: 'lifeFavoriteMusic', addKey: 'addFavoriteMusic', emptyKey: 'emptyFavoriteMusic', titleKey: 'songOrArtist', placeKey: 'musicPeriod', accent: '#C084FC' },
};

const SECTIONS = Object.keys(SECTION_CONFIG) as JourneySection[];

function isSection(value: unknown): value is JourneySection {
  return typeof value === 'string' && value in SECTION_CONFIG;
}

function normalizeItems(value: unknown): JourneyItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const section = isSection(row.section) ? row.section : 'cities';
      return {
        id: typeof row.id === 'string' && row.id ? row.id : `${section}-${index + 1}`,
        section,
        title: typeof row.title === 'string' ? row.title : typeof row.city === 'string' ? row.city : '',
        place: typeof row.place === 'string' ? row.place : typeof row.country === 'string' ? row.country : '',
        from: typeof row.from === 'string' ? row.from : '',
        to: typeof row.to === 'string' ? row.to : '',
        note: typeof row.note === 'string' ? row.note : '',
      };
    })
    .filter(item => item.title || item.place || item.from || item.to || item.note);
}

function migrateLegacy(cities: LegacyCityEntry[], cars: LegacyCarEntry[]): JourneyItem[] {
  return [
    ...cities.map(item => ({ id: item.id || makeId(), section: 'cities' as const, title: item.city || '', place: item.country || '', from: item.from || '', to: item.to || '', note: item.note || '' })),
    ...cars.map(item => ({ id: item.id || makeId(), section: 'cars' as const, title: item.model || '', place: '', from: item.from || '', to: item.to || '', note: item.note || '' })),
  ].filter(item => item.title || item.place || item.from || item.to || item.note);
}

export default function LifeJourneyTab() {
  const { lang, user, familyName, session, activeFamilyId, showNotif } = useStore();
  const storageKey = useMemo(() => `legacychain-life-journey-${user?.email || familyName}`, [familyName, user?.email]);
  const [mode, setMode] = useState<JourneySection>('cities');
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readLocal = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [] as JourneyItem[];
    try {
      const parsed = JSON.parse(saved);
      const normalized = normalizeItems(parsed.items || parsed.cities);
      if (normalized.length) return normalized;
      return migrateLegacy(Array.isArray(parsed.cities) ? parsed.cities : [], Array.isArray(parsed.cars) ? parsed.cars : []);
    } catch {
      return [] as JourneyItem[];
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (session && activeFamilyId) {
        try {
          const response = await fetch(`/api/family-journey?familyId=${encodeURIComponent(activeFamilyId)}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || 'Journey loading failed');
          if (cancelled) return;

          const cloudItems = normalizeItems(data.items || data.cities);
          const legacyItems = migrateLegacy(Array.isArray(data.cities) ? data.cities : [], Array.isArray(data.cars) ? data.cars : []);
          const nextItems = cloudItems.length ? cloudItems : legacyItems.length ? legacyItems : readLocal();
          setItems(nextItems);
        } catch {
          if (cancelled) return;
          setItems(readLocal());
          showNotif(t('familyCloudError', lang), '#FF6B6B');
        } finally {
          if (!cancelled) setLoaded(true);
        }
        return;
      }

      if (!cancelled) {
        setItems(readLocal());
        setLoaded(true);
      }
    };

    setLoaded(false);
    load();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeFamilyId, lang, session, showNotif, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ items }));
  }, [items, storageKey]);

  useEffect(() => {
    if (!loaded || !session || !activeFamilyId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      fetch('/api/family-journey', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familyId: activeFamilyId, items, cities: items, cars: [] }),
      }).catch(() => {
        showNotif(t('familyCloudError', lang), '#FF6B6B');
      });
    }, 450);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeFamilyId, items, lang, loaded, session, showNotif]);

  const inputStyle = {
    width: '100%', padding: '.62rem', borderRadius: 9, border: '1px solid rgba(0,255,209,.14)',
    background: 'rgba(2,6,23,.6)', color: '#EFF6FF', fontFamily: "'DM Mono',monospace", fontSize: '.62rem',
  } as const;
  const cardStyle = { padding: '.75rem', borderRadius: 8, background: 'rgba(0,255,209,.025)', border: '1px solid rgba(0,255,209,.12)' } as const;

  const activeConfig = SECTION_CONFIG[mode];
  const activeItems = items.filter(item => item.section === mode);

  const updateItem = (id: string, patch: Partial<JourneyItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  if (!loaded) {
    return (
      <div>
        <div className="font-display" style={{ fontSize: '.95rem', color: '#00FFD1', letterSpacing: '.15em', marginBottom: '.3rem' }}>{t('lifeJourneyTitle', lang)}</div>
        <p style={{ color: 'rgba(239,246,255,.42)', fontSize: '.6rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{t('lifeJourneySubtitle', lang)}</p>
        <div className="glass-card" style={{ textAlign: 'center', color: 'rgba(239,246,255,.6)' }}>{t('loading', lang)}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-display" style={{ fontSize: '.95rem', color: '#00FFD1', letterSpacing: '.15em', marginBottom: '.3rem' }}>{t('lifeJourneyTitle', lang)}</div>
      <p style={{ color: 'rgba(239,246,255,.42)', fontSize: '.6rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{t('lifeJourneySubtitle', lang)}</p>

      <div className="glass-card" style={{ padding: '.55rem', marginBottom: '.9rem', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '.45rem' }}>
        {SECTIONS.map(section => {
          const config = SECTION_CONFIG[section];
          const Icon = config.icon;
          const active = mode === section;
          return (
            <button key={section} type="button" className="btn-sec" onClick={() => setMode(section)} style={{ minHeight: 42, borderColor: active ? config.accent : undefined, color: active ? config.accent : undefined, justifyContent: 'center' }}>
              <Icon size={14} /> {t(config.labelKey, lang)}
            </button>
          );
        })}
      </div>

      <section className="glass-card">
        <button type="button" className="btn" onClick={() => setItems(prev => [...prev, { id: makeId(), section: mode, title: '', place: '', from: '', to: '', note: '' }])} style={{ width: '100%', marginBottom: '.8rem', borderColor: activeConfig.accent, color: activeConfig.accent }}>
          <Plus size={14} /> {t(activeConfig.addKey, lang)}
        </button>
        {activeItems.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(239,246,255,.28)', fontSize: '.6rem', padding: '1rem' }}>{t(activeConfig.emptyKey, lang)}</div>}
        <div style={{ display: 'grid', gap: '.7rem' }}>
          {activeItems.map(entry => (
            <article key={entry.id} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem', marginBottom: '.45rem' }}>
                <input style={inputStyle} placeholder={t(activeConfig.titleKey, lang)} value={entry.title} onChange={event => updateItem(entry.id, { title: event.target.value })} />
                <input style={inputStyle} placeholder={t(activeConfig.placeKey, lang)} value={entry.place} onChange={event => updateItem(entry.id, { place: event.target.value })} />
                <input style={inputStyle} placeholder={t('dateFrom', lang)} value={entry.from} onChange={event => updateItem(entry.id, { from: event.target.value })} />
                <input style={inputStyle} placeholder={t('dateTo', lang)} value={entry.to} onChange={event => updateItem(entry.id, { to: event.target.value })} />
              </div>
              <input style={inputStyle} placeholder={t('memoryNote', lang)} value={entry.note} onChange={event => updateItem(entry.id, { note: event.target.value })} />
              <button type="button" className="btn-sec" onClick={() => setItems(prev => prev.filter(item => item.id !== entry.id))} style={{ marginTop: '.5rem', color: '#FF6B9D' }}><Trash2 size={13} /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
