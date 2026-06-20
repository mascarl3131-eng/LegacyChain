import { useState } from 'react';
import { CheckCircle2, ChevronDown, Download, FileUp, ListChecks } from 'lucide-react';
import type { LangCode } from '@/lib/i18n';
import { t } from '@/lib/i18n';

const STEPS = [
  { icon: Download, title: 'dnaGuideStep1Title', text: 'dnaGuideStep1Text' },
  { icon: FileUp, title: 'dnaGuideStep2Title', text: 'dnaGuideStep2Text' },
  { icon: ListChecks, title: 'dnaGuideStep3Title', text: 'dnaGuideStep3Text' },
];

export default function DnaQuickGuide({ lang }: { lang: LangCode }) {
  const [open, setOpen] = useState(true);

  return (
    <section style={{ marginBottom: '1rem', borderRadius: 12, border: '1px solid rgba(0,255,209,.18)', background: 'rgba(0,255,209,.035)', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} style={{ width: '100%', border: 0, background: 'transparent', color: '#EFF6FF', padding: '.8rem .9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.7rem', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
          <CheckCircle2 size={16} color="#00FFD1" />
          <span>
            <strong style={{ display: 'block', color: '#00FFD1', fontSize: '.65rem', letterSpacing: '.11em' }}>{t('dnaGuideTitle', lang)}</strong>
            <small style={{ color: 'rgba(239,246,255,.38)', fontSize: '.52rem' }}>{t('dnaGuideSubtitle', lang)}</small>
          </span>
        </span>
        <ChevronDown size={16} style={{ flexShrink: 0, color: 'rgba(239,246,255,.4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(0,255,209,.1)', padding: '.75rem .9rem .9rem', display: 'grid', gap: '.65rem' }}>
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div key={title} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: '.6rem', alignItems: 'start' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(0,255,209,.08)', border: '1px solid rgba(0,255,209,.18)', color: '#00FFD1', position: 'relative' }}>
                <Icon size={13} />
                <small style={{ position: 'absolute', right: -4, top: -5, width: 14, height: 14, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#00FFD1', color: '#04030A', fontSize: '.42rem', fontWeight: 800 }}>{index + 1}</small>
              </span>
              <div>
                <strong style={{ display: 'block', color: 'rgba(239,246,255,.78)', fontSize: '.59rem', marginBottom: '.15rem' }}>{t(title, lang)}</strong>
                <span style={{ color: 'rgba(239,246,255,.4)', fontSize: '.53rem', lineHeight: 1.55 }}>{t(text, lang)}</span>
              </div>
            </div>
          ))}
          <div style={{ color: 'rgba(255,179,71,.62)', fontSize: '.5rem', lineHeight: 1.55, paddingTop: '.25rem', borderTop: '1px solid rgba(255,179,71,.1)' }}>{t('dnaGuidePrivacy', lang)}</div>
        </div>
      )}
    </section>
  );
}
