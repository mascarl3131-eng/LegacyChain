import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Flag, HandHeart, Heart, Languages, Search, Share2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { FLAGS, BANNED_WORDS, getDemoHumanity } from '@/lib/data';
import HumanityWorldMap from '@/components/HumanityWorldMap';

const EMOTIONS = ['hope', 'love', 'wisdom', 'peace', 'warning', 'memory'];
const AUDIENCES = ['future', 'descendants', 'humanity', 'whoever'];
const AUDIENCE_KEYS: Record<string, string> = {
  future: 'toFuture',
  descendants: 'toDescendants',
  humanity: 'toHumanity',
  whoever: 'toWhoever',
};
const PER_PAGE = 20;
const EMO_GLOW: Record<string, string> = { hope: '#00FFD1', love: '#FF6B9D', wisdom: '#C084FC', memory: '#FFB347', warning: '#FF2D55', peace: '#7DD3FC' };

type Voice = {
  id: string; display_name: string; show_profile: boolean; country: string; country_code?: string | null;
  message: string; emotion: string; audience: string; language: string; reaction_count: number; created_at: string;
};

function getVisitorId() {
  const current = localStorage.getItem('legacychain-visitor-id');
  if (current) return current;
  const id = crypto.randomUUID();
  localStorage.setItem('legacychain-visitor-id', id);
  return id;
}

export default function HumanityTab() {
  const { lang, session, user, hEmo, setHEmo, setShowSubmitAnim, showNotif } = useStore();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [total, setTotal] = useState(0);
  const [facetCountries, setFacetCountries] = useState<string[]>([]);
  const [facetYears, setFacetYears] = useState<number[]>([]);
  const [facetCountryCounts, setFacetCountryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sampleMode, setSampleMode] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [country, setCountry] = useState('');
  const [year, setYear] = useState('');
  const [emotion, setEmotion] = useState('');
  const [audience, setAudience] = useState('');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'all' | 'country' | 'year'>('all');
  const [page, setPage] = useState(1);
  const [liked, setLiked] = useState<Record<string, string>>({});
  const [hName, setHName] = useState('');
  const [hCountry, setHCountry] = useState('');
  const [hAudience, setHAudience] = useState('future');
  const [hMsg, setHMsg] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'family'>('public');
  const [showProfile, setShowProfile] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCountry = params.get('voiceCountry');
    if (initialCountry) {
      setCountry(initialCountry);
      setViewMode('country');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    const loadVoices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          perPage: String(PER_PAGE),
          sort,
        });
        if (debouncedQuery) params.set('search', debouncedQuery);
        if (country) params.set('country', country);
        if (year) params.set('year', year);
        if (emotion) params.set('emotion', emotion);
        if (audience) params.set('audience', audience);
        const response = await fetch(`/api/humanity-messages?${params}`);
        if (!response.ok) throw new Error('Voices database unavailable');
        const data = await response.json();
        if (!active) return;
        setVoices(data.messages || []);
        setTotal(data.total || 0);
        setFacetCountries(data.countries || []);
        setFacetYears(data.years || []);
        setFacetCountryCounts(data.countryCounts || {});
        setSampleMode(false);
      } catch {
        if (!active) return;
        const samples = getDemoHumanity(lang).map(item => ({
          id: item.id, display_name: item.a, show_profile: false, country: item.c, message: item.text,
          emotion: item.e, audience: 'future', language: lang, reaction_count: item.likes,
          created_at: `${item.y}-06-20T00:00:00Z`,
        }));
        setVoices(samples);
        setTotal(samples.length);
        setFacetCountries([...new Set(samples.map(item => item.country))].sort());
        setFacetYears([...new Set(samples.map(item => new Date(item.created_at).getFullYear()))].sort((a, b) => b - a));
        setFacetCountryCounts(samples.reduce<Record<string, number>>((acc, item) => {
          acc[item.country] = (acc[item.country] || 0) + 1;
          return acc;
        }, {}));
        setSampleMode(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadVoices();
    return () => { active = false; };
  }, [audience, country, debouncedQuery, emotion, lang, page, sort, year]);

  const filtered = useMemo(() => {
    if (!sampleMode) return voices;
    const result = voices.filter(item => {
      const haystack = `${item.display_name} ${item.country} ${item.message}`.toLocaleLowerCase();
      return (!query || haystack.includes(query.toLocaleLowerCase()))
        && (!country || item.country === country)
        && (!year || new Date(item.created_at).getFullYear() === Number(year))
        && (!emotion || item.emotion === emotion)
        && (!audience || item.audience === audience);
    });
    return [...result].sort((a, b) => sort === 'popular'
      ? b.reaction_count - a.reaction_count
      : sort === 'oldest'
        ? +new Date(a.created_at) - +new Date(b.created_at)
        : +new Date(b.created_at) - +new Date(a.created_at));
  }, [audience, country, emotion, query, sampleMode, sort, voices, year]);
  const effectiveTotal = sampleMode ? filtered.length : total;
  const pageCount = Math.max(1, Math.ceil(effectiveTotal / PER_PAGE));
  const displayed = sampleMode ? filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE) : filtered;
  const featured = filtered[0];
  useEffect(() => setPage(1), [audience, country, emotion, query, sort, year]);

  const selectCountry = (value: string) => {
    setCountry(value);
    setPage(1);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('voiceCountry', value); else url.searchParams.delete('voiceCountry');
    window.history.replaceState({}, '', url);
  };

  const selectView = (next: 'all' | 'country' | 'year') => {
    setViewMode(next);
    setPage(1);
    if (next === 'all') {
      selectCountry('');
      setYear('');
    } else if (next === 'country') {
      setYear('');
    } else {
      selectCountry('');
    }
  };

  const react = async (voice: Voice, reaction: string) => {
    if (sampleMode) return;
    const visitorId = getVisitorId();
    const current = liked[voice.id];
    setLiked(state => ({ ...state, [voice.id]: current === reaction ? '' : reaction }));
    const response = await fetch('/api/humanity-reactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({ messageId: voice.id, visitorId, reaction }),
    });
    if (response.ok) {
      const data = await response.json();
      setVoices(items => items.map(item => item.id === voice.id ? { ...item, reaction_count: data.count } : item));
    }
  };

  const share = async (voice: Voice) => {
    const url = new URL(window.location.href);
    url.searchParams.set('voice', voice.id);
    const shareData = { title: 'LegacyChain · Voices of Humanity', text: voice.message, url: url.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url.toString());
        showNotif(t('linkCopied', lang), '#00FFD1');
      }
    } catch {
      // Closing the native share sheet is not an application error.
    }
  };

  const report = async (voice: Voice) => {
    if (sampleMode) return;
    const reason = prompt(t('reportReason', lang));
    if (!reason) return;
    const response = await fetch('/api/humanity-reports', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({ messageId: voice.id, visitorId: getVisitorId(), reason }),
    });
    if (response.ok) showNotif(t('reportSent', lang), '#FFB347');
  };

  const submit = async () => {
    const text = hMsg.trim();
    setFormError('');
    if (!text || !hCountry.trim()) return setFormError(t('completeRequired', lang));
    if (BANNED_WORDS.some(word => text.toLowerCase().includes(word))) return setFormError(t('modBanned', lang));
    if (visibility === 'family' && !session) return setFormError(t('loginForFamilyVoice', lang));

    const response = await fetch('/api/humanity-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
      body: JSON.stringify({
        message: text, country: hCountry.trim(), emotion: hEmo, audience: hAudience,
        visibility, language: lang, displayName: hName.trim(), showProfile,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setFormError(data.error || t('publishError', lang));

    setShowSubmitAnim(true);
    setHMsg(''); setHName(''); setFormError('');
    if (visibility === 'public') {
      setVoices(items => [data.message, ...items].slice(0, PER_PAGE));
      setTotal(value => value + 1);
    }
    showNotif(t('voiceSealed', lang), '#00FFD1');
  };

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '1.4rem .5rem 1.1rem' }}>
        <div className="font-display" style={{ fontSize: 'clamp(1.25rem,6vw,2.2rem)', color: '#EFF6FF', letterSpacing: '.12em' }}>{t('hvTitle', lang)}</div>
        <p style={{ fontSize: '.7rem', color: 'rgba(239,246,255,.38)', lineHeight: 1.7 }}>{t('hvSub', lang)}</p>
        <div style={{ fontSize: '.62rem', color: 'rgba(239,246,255,.35)' }}><strong style={{ color: '#00FFD1' }}>{total}</strong> {t('recentVoices', lang)} · <strong style={{ color: '#00FFD1' }}>{facetCountries.length}</strong> {t('countries', lang)}</div>
        {sampleMode && <div style={{ color: '#FFB347', fontSize: '.52rem', marginTop: '.45rem' }}>{t('sampleVoicesNotice', lang)}</div>}
      </header>

      <HumanityWorldMap counts={facetCountryCounts} selectedCountry={country} onSelect={value => { setViewMode('country'); selectCountry(value); }} />

      <div className="glass-card" style={{ marginTop: '.75rem', padding: '.8rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '.35rem', marginBottom: '.65rem' }}>
          {([
            ['all', 'viewAllVoices'],
            ['country', 'viewByCountry'],
            ['year', 'viewByYear'],
          ] as const).map(([mode, label]) => (
            <button key={mode} className="btn-sec" onClick={() => selectView(mode)} style={{
              borderColor: viewMode === mode ? '#00FFD1' : undefined,
              color: viewMode === mode ? '#00FFD1' : undefined,
              background: viewMode === mode ? 'rgba(0,255,209,.06)' : undefined,
            }}>{t(label, lang)}</button>
          ))}
        </div>
        {viewMode === 'country' && (
          <div style={{ display: 'flex', gap: '.35rem', overflowX: 'auto', paddingBottom: '.5rem', marginBottom: '.3rem' }}>
            {facetCountries.map(item => <button key={item} className="btn-sec" onClick={() => selectCountry(item)} style={{ whiteSpace: 'nowrap', borderColor: country === item ? '#FFB347' : undefined, color: country === item ? '#FFB347' : undefined }}>{item} · {facetCountryCounts[item] || 0}</button>)}
          </div>
        )}
        {viewMode === 'year' && (
          <div style={{ display: 'flex', gap: '.35rem', overflowX: 'auto', paddingBottom: '.5rem', marginBottom: '.3rem' }}>
            {facetYears.map(item => <button key={item} className="btn-sec" onClick={() => { setYear(String(item)); setPage(1); }} style={{ whiteSpace: 'nowrap', borderColor: year === String(item) ? '#FFB347' : undefined, color: year === String(item) ? '#FFB347' : undefined }}>{item}</button>)}
          </div>
        )}
        <div style={{ position: 'relative', marginBottom: '.45rem' }}><Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'rgba(239,246,255,.3)' }} /><input className="form-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchVoices', lang)} style={{ paddingLeft: 32 }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '.4rem' }}>
          <select className="form-select" value={country} onChange={event => { setViewMode(event.target.value ? 'country' : viewMode); selectCountry(event.target.value); }}><option value="">{t('allCountries', lang)}</option>{facetCountries.map(item => <option key={item}>{item}</option>)}</select>
          <select className="form-select" value={year} onChange={event => { setViewMode(event.target.value ? 'year' : viewMode); setYear(event.target.value); setPage(1); }}><option value="">{t('allYears', lang)}</option>{facetYears.map(item => <option key={item}>{item}</option>)}</select>
          <select className="form-select" value={emotion} onChange={event => setEmotion(event.target.value)}><option value="">{t('allEmotions', lang)}</option>{EMOTIONS.map(item => <option key={item} value={item}>{t(`e${item[0].toUpperCase()}${item.slice(1)}`, lang)}</option>)}</select>
          <select className="form-select" value={audience} onChange={event => setAudience(event.target.value)}><option value="">{t('allAudiences', lang)}</option>{AUDIENCES.map(item => <option key={item} value={item}>{t(AUDIENCE_KEYS[item], lang)}</option>)}</select>
          <select className="form-select" value={sort} onChange={event => setSort(event.target.value)} style={{ gridColumn: '1 / -1' }}><option value="newest">{t('newestFirst', lang)}</option><option value="oldest">{t('oldestFirst', lang)}</option><option value="popular">{t('mostSupported', lang)}</option></select>
        </div>
      </div>

      {featured && page === 1 && (
        <div className="glass-card" style={{ marginTop: '.75rem', borderColor: 'rgba(255,179,71,.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#FFB347', fontSize: '.58rem', letterSpacing: '.12em', marginBottom: '.55rem' }}><Sparkles size={14} /> {t('featuredVoice', lang)}</div>
          <div style={{ color: 'rgba(239,246,255,.82)', fontSize: '.8rem', lineHeight: 1.75 }}>{featured.message}</div>
          <div style={{ color: 'rgba(239,246,255,.35)', fontSize: '.56rem', marginTop: '.55rem' }}>{featured.country} · {new Date(featured.created_at).getFullYear()}</div>
        </div>
      )}

      <div style={{ marginTop: '.75rem' }}>
        {loading ? <div className="glass-card" style={{ textAlign: 'center' }}>{t('loadingVoices', lang)}</div> : displayed.map(voice => {
          const activeReaction = liked[voice.id];
          const flag = FLAGS[voice.country] || '🌍';
          return (
            <article key={voice.id} className="glass-card" style={{ marginBottom: '.7rem', borderTopColor: EMO_GLOW[voice.emotion] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.7rem' }}>
                <div><div style={{ color: '#00FFD1', fontSize: '.61rem' }}>{voice.show_profile ? voice.display_name : `${flag} ${voice.country}`}</div><div style={{ color: 'rgba(239,246,255,.28)', fontSize: '.51rem', marginTop: 2 }}>{new Date(voice.created_at).toLocaleDateString(lang)} · {t(AUDIENCE_KEYS[voice.audience] || 'toFuture', lang)}</div></div>
                <span style={{ color: EMO_GLOW[voice.emotion], fontSize: '.5rem' }}>{t(`e${voice.emotion[0].toUpperCase()}${voice.emotion.slice(1)}`, lang)}</span>
              </div>
              <p style={{ color: 'rgba(239,246,255,.8)', fontSize: '.76rem', lineHeight: 1.75 }}>{voice.message}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '.25rem' }}>
                  <button className="btn-sec" onClick={() => void react(voice, 'hope')} style={{ color: activeReaction === 'hope' ? '#FFB347' : undefined, padding: '.28rem .45rem' }} aria-label={t('supportVoice', lang)}><Sparkles size={12} /></button>
                  <button className="btn-sec" onClick={() => void react(voice, 'love')} style={{ color: activeReaction === 'love' ? '#FF6B9D' : undefined, padding: '.28rem .45rem' }} aria-label={t('loveVoice', lang)}><Heart size={12} /></button>
                  <button className="btn-sec" onClick={() => void react(voice, 'support')} style={{ color: activeReaction === 'support' ? '#00FFD1' : undefined, padding: '.28rem .45rem' }} aria-label={t('supportVoice', lang)}><HandHeart size={12} /></button>
                </div>
                <div style={{ display: 'flex', gap: '.25rem' }}><span style={{ color: 'rgba(239,246,255,.35)', fontSize: '.55rem', alignSelf: 'center' }}><Heart size={11} style={{ display: 'inline' }} /> {voice.reaction_count}</span><button className="btn-sec" onClick={() => void share(voice)} aria-label={t('shareVoice', lang)}><Share2 size={12} /></button><a className="btn-sec" href={`https://translate.google.com/?sl=auto&tl=${lang}&text=${encodeURIComponent(voice.message)}&op=translate`} target="_blank" rel="noreferrer" aria-label={t('translateVoice', lang)}><Languages size={12} /></a><button className="btn-sec" onClick={() => void report(voice)} aria-label={t('reportVoice', lang)}><Flag size={12} /></button></div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.55rem', margin: '1rem 0' }}>
        <button className="btn-sec" disabled={page <= 1} onClick={() => setPage(value => value - 1)}><ChevronLeft size={14} /></button>
        <span style={{ color: 'rgba(239,246,255,.45)', fontSize: '.6rem' }}>{page} / {pageCount}</span>
        <button className="btn-sec" disabled={page >= pageCount} onClick={() => setPage(value => value + 1)}><ChevronRight size={14} /></button>
      </div>

      <section className="glass-card">
        <div style={{ color: '#00FFD1', fontSize: '.7rem', letterSpacing: '.15em', marginBottom: '.8rem' }}>{t('leaveVoice', lang)}</div>
        <input className="form-input" value={hCountry} onChange={event => setHCountry(event.target.value)} placeholder={t('country', lang)} style={{ marginBottom: '.55rem' }} />
        <input className="form-input" value={hName} onChange={event => setHName(event.target.value)} placeholder={`${t('yourName', lang)} (${t('optional', lang)})`} style={{ marginBottom: '.55rem' }} />
        <select className="form-select" value={hAudience} onChange={event => setHAudience(event.target.value)} style={{ marginBottom: '.55rem' }}>{AUDIENCES.map(item => <option key={item} value={item}>{t(AUDIENCE_KEYS[item], lang)}</option>)}</select>
        <textarea className="form-textarea" value={hMsg} onChange={event => setHMsg(event.target.value)} maxLength={500} placeholder={t('yourMsg', lang)} />
        <div style={{ textAlign: 'right', color: 'rgba(239,246,255,.25)', fontSize: '.52rem' }}>{hMsg.length}/500</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', margin: '.55rem 0' }}>{EMOTIONS.map(item => <button key={item} className={`emo-btn sel-${item === hEmo ? item : ''}`} onClick={() => setHEmo(item)}>{t(`e${item[0].toUpperCase()}${item.slice(1)}`, lang)}</button>)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.4rem', marginBottom: '.55rem' }}><button className="btn-sec" onClick={() => setVisibility('public')} style={{ borderColor: visibility === 'public' ? '#00FFD1' : undefined, color: visibility === 'public' ? '#00FFD1' : undefined }}>{t('publicVoice', lang)}</button><button className="btn-sec" onClick={() => setVisibility('family')} style={{ borderColor: visibility === 'family' ? '#C084FC' : undefined, color: visibility === 'family' ? '#C084FC' : undefined }}>{t('familyVoice', lang)}</button></div>
        {session && <label style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: 'rgba(239,246,255,.45)', fontSize: '.58rem', marginBottom: '.6rem' }}><input type="checkbox" checked={showProfile} onChange={event => setShowProfile(event.target.checked)} /> {t('showPublicProfile', lang)} ({user?.first})</label>}
        {formError && <div style={{ color: '#FF6B6B', fontSize: '.58rem', marginBottom: '.5rem' }}>{formError}</div>}
        <button className="btn-primary" onClick={() => void submit()} disabled={sampleMode}>{sampleMode ? t('databaseSetupRequired', lang) : t('sealVoice', lang)}</button>
        <div style={{ color: 'rgba(239,246,255,.2)', textAlign: 'center', fontSize: '.5rem', marginTop: '.45rem' }}>{t('aiReview', lang)} <ExternalLink size={9} style={{ display: 'inline' }} /></div>
      </section>
    </div>
  );
}
