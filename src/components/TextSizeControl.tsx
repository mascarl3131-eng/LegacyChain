import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import type { LangCode } from '@/lib/i18n';

type TextScale = 'normal' | 'large' | 'xlarge';

const STORAGE_KEY = 'legacychain-text-scale';

const LABELS: Record<LangCode, { title: string; normal: string; large: string; xlarge: string }> = {
  en: { title: 'Text size', normal: 'Normal text', large: 'Large text', xlarge: 'Very large text' },
  fr: { title: 'Taille du texte', normal: 'Texte normal', large: 'Texte large', xlarge: 'Texte très large' },
  es: { title: 'Tamaño del texto', normal: 'Texto normal', large: 'Texto grande', xlarge: 'Texto muy grande' },
  pt: { title: 'Tamanho do texto', normal: 'Texto normal', large: 'Texto grande', xlarge: 'Texto muito grande' },
  de: { title: 'Textgröße', normal: 'Normaler Text', large: 'Großer Text', xlarge: 'Sehr großer Text' },
  it: { title: 'Dimensione testo', normal: 'Testo normale', large: 'Testo grande', xlarge: 'Testo molto grande' },
  ar: { title: 'حجم النص', normal: 'نص عادي', large: 'نص كبير', xlarge: 'نص كبير جدًا' },
  zh: { title: '文字大小', normal: '标准文字', large: '大文字', xlarge: '超大文字' },
  ja: { title: '文字サイズ', normal: '標準', large: '大きい', xlarge: '特大' },
  ko: { title: '글자 크기', normal: '보통 글자', large: '큰 글자', xlarge: '매우 큰 글자' },
  ru: { title: 'Размер текста', normal: 'Обычный текст', large: 'Крупный текст', xlarge: 'Очень крупный текст' },
  hi: { title: 'टेक्स्ट आकार', normal: 'सामान्य टेक्स्ट', large: 'बड़ा टेक्स्ट', xlarge: 'बहुत बड़ा टेक्स्ट' },
  sw: { title: 'Ukubwa wa maandishi', normal: 'Maandishi ya kawaida', large: 'Maandishi makubwa', xlarge: 'Makubwa sana' },
  nl: { title: 'Tekstgrootte', normal: 'Normale tekst', large: 'Grote tekst', xlarge: 'Zeer grote tekst' },
};

function readInitialScale(): TextScale {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'normal' || saved === 'xlarge' || saved === 'large' ? saved : 'large';
}

export default function TextSizeControl({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();
  const [scale, setScale] = useState<TextScale>(readInitialScale);

  const labels = LABELS[lang] || LABELS.en;
  const scales: TextScale[] = useMemo(() => ['normal', 'large', 'xlarge'], []);
  const index = scales.indexOf(scale);

  useEffect(() => {
    document.documentElement.dataset.textScale = scale;
    localStorage.setItem(STORAGE_KEY, scale);
  }, [scale]);

  return (
    <div
      className="text-size-control"
      title={labels.title}
      aria-label={labels.title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? '0.25rem' : '0.4rem',
        padding: compact ? '0.18rem' : '0.25rem',
        border: '1px solid rgba(0,255,209,0.25)',
        borderRadius: 999,
        background: 'rgba(4,3,10,0.82)',
        boxShadow: '0 0 18px rgba(0,255,209,0.08)',
      }}
    >
      <button
        type="button"
        onClick={() => setScale(scales[Math.max(0, index - 1)])}
        disabled={index === 0}
        aria-label="A minus"
        style={{
          width: compact ? 30 : 36,
          height: compact ? 30 : 36,
          borderRadius: '50%',
          border: '1px solid rgba(239,246,255,0.18)',
          background: 'rgba(239,246,255,0.05)',
          color: index === 0 ? 'rgba(239,246,255,0.28)' : '#EFF6FF',
          cursor: index === 0 ? 'not-allowed' : 'pointer',
          fontWeight: 800,
        }}
      >
        A-
      </button>
      {!compact && (
        <span style={{ color: 'rgba(239,246,255,0.8)', fontSize: '0.72rem', minWidth: 108, textAlign: 'center' }}>
          {labels[scale]}
        </span>
      )}
      <button
        type="button"
        onClick={() => setScale(scales[Math.min(scales.length - 1, index + 1)])}
        disabled={index === scales.length - 1}
        aria-label="A plus"
        style={{
          width: compact ? 30 : 36,
          height: compact ? 30 : 36,
          borderRadius: '50%',
          border: '1px solid rgba(0,255,209,0.45)',
          background: 'rgba(0,255,209,0.1)',
          color: index === scales.length - 1 ? 'rgba(0,255,209,0.35)' : '#00FFD1',
          cursor: index === scales.length - 1 ? 'not-allowed' : 'pointer',
          fontWeight: 900,
        }}
      >
        A+
      </button>
    </div>
  );
}
