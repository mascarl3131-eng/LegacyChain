import { useState } from 'react';
import { Check, Link2, MapPinned, Palette, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import ChainTab from '@/tabs/ChainTab';
import LifeJourneyTab from '@/tabs/LifeJourneyTab';
import MuralTab from '@/tabs/MuralTab';

export default function FamilyLegacyTab() {
  const { tab, lang, premium, setUpgradeOpen } = useStore();
  const [section, setSection] = useState<'messages' | 'journey' | 'mural'>(tab === 'mural' ? 'mural' : 'messages');

  return (
    <div>
      {!premium && (
        <section style={{ marginBottom: '.8rem', padding: '.8rem', borderRadius: 11, border: '1px solid rgba(255,179,71,.22)', background: 'linear-gradient(135deg,rgba(255,179,71,.06),rgba(192,132,252,.035))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', color: '#FFB347', fontSize: '.62rem', letterSpacing: '.1em', marginBottom: '.4rem' }}><Sparkles size={14} /> {t('familyPremiumTitle', lang)}</div>
          <p style={{ margin: '0 0 .55rem', color: 'rgba(239,246,255,.42)', fontSize: '.54rem', lineHeight: 1.6 }}>{t('familyPremiumDesc', lang)}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.35rem' }}>
            {['familyPremiumPhotos', 'familyPremiumVoices', 'familyPremiumMural', 'familyPremiumExport'].map(key => (
              <span key={key} style={{ display: 'flex', gap: '.3rem', color: 'rgba(239,246,255,.58)', fontSize: '.5rem', lineHeight: 1.45 }}><Check size={11} color="#00FFD1" style={{ flexShrink: 0 }} />{t(key, lang)}</span>
            ))}
          </div>
          <button type="button" className="btn-amber" onClick={() => setUpgradeOpen(true)} style={{ marginTop: '.65rem', width: '100%' }}>{t('discoverPremium', lang)}</button>
        </section>
      )}
      <div className="glass-card" style={{ padding: '.55rem', marginBottom: '.9rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.45rem', position: 'sticky', top: 0, zIndex: 5, backdropFilter: 'blur(12px)' }}>
        <button type="button" className="btn-sec" onClick={() => setSection('messages')} style={{ minHeight: 42, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', borderColor: section === 'messages' ? '#00FFD1' : undefined, color: section === 'messages' ? '#00FFD1' : undefined, background: section === 'messages' ? 'rgba(0,255,209,.06)' : undefined }}>
          <Link2 size={15} /> {t('familyMessagesTab', lang)}
        </button>
        <button type="button" className="btn-sec" onClick={() => setSection('journey')} style={{ minHeight: 42, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', borderColor: section === 'journey' ? '#00FFD1' : undefined, color: section === 'journey' ? '#00FFD1' : undefined, background: section === 'journey' ? 'rgba(0,255,209,.06)' : undefined }}>
          <MapPinned size={15} /> {lang === 'fr' ? 'Parcours' : 'Journey'}
        </button>
        <button type="button" className="btn-sec" onClick={() => premium ? setSection('mural') : setUpgradeOpen(true)} style={{ minHeight: 42, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', borderColor: section === 'mural' ? '#C084FC' : undefined, color: section === 'mural' ? '#C084FC' : undefined, background: section === 'mural' ? 'rgba(192,132,252,.07)' : undefined }}>
          <Palette size={15} /> {t('familyMuralTab', lang)} {!premium && <Sparkles size={11} color="#FFB347" />}
        </button>
      </div>
      {section === 'messages' ? <ChainTab /> : section === 'journey' ? <LifeJourneyTab /> : <MuralTab />}
    </div>
  );
}
