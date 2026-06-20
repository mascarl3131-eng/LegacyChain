import { useRef, useState } from 'react';
import { BrainCircuit, FileCheck2, LockKeyhole, Upload } from 'lucide-react';
import type { OriginRow } from '@/lib/data';
import type { LangCode } from '@/lib/i18n';
import { t } from '@/lib/i18n';

type Analysis = {
  fileName: string;
  rows: OriginRow[];
  rawGenotype: boolean;
};

function cleanCountry(value: string) {
  return value
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/^(region|country|population|ethnicity|origine|pays)\s*[:=-]\s*/i, '')
    .trim();
}

function extractFromJson(value: unknown): OriginRow[] {
  const found: OriginRow[] = [];
  const visit = (item: unknown) => {
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (!item || typeof item !== 'object') return;
    const record = item as Record<string, unknown>;
    const country = record.country ?? record.region ?? record.population ?? record.ethnicity ?? record.name ?? record.origine ?? record.pays;
    const percentage = record.percentage ?? record.percent ?? record.value ?? record.pourcentage;
    if (typeof country === 'string' && (typeof percentage === 'number' || typeof percentage === 'string')) {
      const parsed = Number(String(percentage).replace(',', '.').replace('%', ''));
      if (Number.isFinite(parsed)) found.push({ c: cleanCountry(country), p: Math.round(parsed * 10) / 10 });
    }
    Object.values(record).forEach(visit);
  };
  visit(value);
  return found;
}

function extractFromText(text: string): OriginRow[] {
  const rows: OriginRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^"?([^,;\t:%]+?)"?\s*(?:[,;\t:]|\s{2,})\s*([0-9]+(?:[.,][0-9]+)?)\s*%?\s*$/)
      || trimmed.match(/^(.+?)\s+([0-9]+(?:[.,][0-9]+)?)\s*%\s*$/);
    if (!match) continue;
    const country = cleanCountry(match[1]);
    const percentage = Number(match[2].replace(',', '.'));
    if (country && Number.isFinite(percentage) && percentage > 0 && percentage <= 100) {
      rows.push({ c: country, p: Math.round(percentage * 10) / 10 });
    }
  }
  return rows;
}

function mergeRows(rows: OriginRow[]) {
  const merged = new Map<string, OriginRow>();
  rows.forEach(row => {
    const key = row.c.toLocaleLowerCase();
    const current = merged.get(key);
    merged.set(key, { c: current?.c || row.c, p: Math.round(((current?.p || 0) + row.p) * 10) / 10 });
  });
  return [...merged.values()].filter(row => row.p > 0).sort((a, b) => b.p - a.p).slice(0, 20);
}

export default function DnaImportPanel({ lang, onApply }: { lang: LangCode; onApply: (rows: OriginRow[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error(t('dnaFileTooLarge', lang));
      const text = await file.text();
      const rawGenotype = /(^|\n)\s*(rs\d+|i\d+)\s+(\d+|X|Y|MT)\s+\d+\s+[ACGTDI-]{1,4}/im.test(text);
      let rows: OriginRow[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        rows = extractFromJson(JSON.parse(text));
      } else {
        rows = extractFromText(text);
      }
      rows = mergeRows(rows);
      setAnalysis({ fileName: file.name, rows, rawGenotype });
      if (!rows.length) setError(rawGenotype ? t('dnaRawUnsupported', lang) : t('dnaNoOriginsFound', lang));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('dnaReadError', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginBottom: '1.2rem', padding: '1rem', borderRadius: 12, border: '1px solid rgba(192,132,252,0.25)', background: 'linear-gradient(135deg,rgba(192,132,252,0.07),rgba(0,255,209,0.035))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#C084FC', fontSize: '0.67rem', letterSpacing: '0.12em', marginBottom: '0.45rem' }}>
        <BrainCircuit size={17} />
        {t('dnaAssistantTitle', lang)}
      </div>
      <p style={{ fontSize: '0.62rem', color: 'rgba(239,246,255,0.48)', lineHeight: 1.65, marginBottom: '0.8rem' }}>
        {t('dnaAssistantDesc', lang)}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,.json,text/csv,text/plain,application/json"
        hidden
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) void analyze(file);
          event.target.value = '';
        }}
      />
      <button type="button" className="btn-sec" onClick={() => inputRef.current?.click()} disabled={loading} style={{ width: '100%', minHeight: 52, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Upload size={16} />
        {loading ? t('dnaAnalyzing', lang) : t('dnaUploadBtn', lang)}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.32rem', marginTop: '0.55rem', color: 'rgba(0,255,209,0.48)', fontSize: '0.52rem' }}>
        <LockKeyhole size={11} />
        {t('dnaLocalPrivacy', lang)}
      </div>

      {analysis && (
        <div style={{ marginTop: '0.8rem', padding: '0.75rem', borderRadius: 8, background: 'rgba(2,8,18,0.55)', border: '1px solid rgba(239,246,255,0.09)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EFF6FF', fontSize: '0.62rem', marginBottom: '0.5rem' }}>
            <FileCheck2 size={14} color="#00FFD1" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analysis.fileName}</span>
          </div>
          {analysis.rows.map((row, index) => (
            <div key={`${row.c}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.28rem 0', borderBottom: '1px solid rgba(239,246,255,0.06)', fontSize: '0.6rem', color: 'rgba(239,246,255,0.62)' }}>
              <span>{row.c}</span><strong style={{ color: '#00FFD1' }}>{row.p}%</strong>
            </div>
          ))}
          {analysis.rows.length > 0 && (
            <button type="button" className="btn-primary" onClick={() => onApply(analysis.rows)} style={{ marginTop: '0.7rem' }}>
              {t('dnaApplyResults', lang)}
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '0.7rem', padding: '0.65rem', borderRadius: 7, border: '1px solid rgba(255,179,71,0.3)', background: 'rgba(255,179,71,0.06)', color: '#FFB347', fontSize: '0.58rem', lineHeight: 1.55 }}>
          {error}
        </div>
      )}
    </section>
  );
}
