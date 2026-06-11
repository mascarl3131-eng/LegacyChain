import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getBookChs } from '@/lib/data';

export default function BookTab() {
  const { lang, premium, user, bookData, setBookData, chapter, setChapter, setUpgradeOpen } = useStore();
  const [showPreview, setShowPreview] = useState(false);
  const chs = getBookChs(lang);

  const updateField = (ci: number, fi: number, val: string) => {
    setBookData({ ...bookData, [`${ci}-${fi}`]: val });
  };

  const generatePDF = () => {
    if (!premium) { setUpgradeOpen(true); return; }
    setShowPreview(true);
  };

  const downloadPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const year = new Date().getFullYear();
    let html = `<!DOCTYPE html><html><head><title>Book of Life</title><style>
      body{font-family:Georgia,serif;max-width:700px;margin:2rem auto;padding:1rem;line-height:1.8;color:#1a1a2e}
      h1{text-align:center}h2{font-size:1.1rem;margin:1.5rem 0 0.5rem;color:#1a1a4e;border-bottom:1px solid #ddd;padding-bottom:0.3rem}
      p{margin:0.5rem 0;font-size:0.95rem}.pdf-footer{margin-top:2rem;text-align:center;font-size:0.75rem;color:#999;border-top:1px solid #eee;padding-top:1rem}
    </style></head><body>`;
    html += `<h1>📖 Book of Life — ${user?.name || 'Anonymous'}</h1><p style="text-align:center;font-size:0.7rem;color:#666;margin-bottom:1rem">Written in ${year}</p>`;
    chs.forEach((ch, i) => {
      html += `<h2>Ch.${i + 1} — ${ch.t}</h2>`;
      ch.fields.forEach((f, fi) => {
        const val = bookData[`${i}-${fi}`];
        if (val) html += `<p><strong>${f.l}:</strong><br>${val.replace(/\n/g, '<br>')}</p>`;
      });
    });
    html += `<div class="pdf-footer">LegacyChain · A blockchain of love · ${year}<br>Written by ${user?.name || 'Anonymous'}</div></body></html>`;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('bookTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('bookSub', lang)}</div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.3rem', flexWrap: 'wrap' }}>
        {chs.map((_, i) => (
          <div
            key={i}
            onClick={() => setChapter(i)}
            style={{
              width: 24, height: 24, borderRadius: '50%', border: `1px solid ${i === chapter ? '#00FFD1' : i < chapter ? '#00FFD1' : 'rgba(0,255,209,0.13)'}`,
              color: i === chapter ? '#04030A' : i < chapter ? '#00FFD1' : 'rgba(239,246,255,0.25)',
              background: i === chapter ? '#00FFD1' : i < chapter ? 'rgba(0,255,209,0.09)' : 'transparent',
              fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ height: 2, background: 'rgba(0,255,209,0.13)', borderRadius: 1, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#00FFD1', transition: 'width 0.5s', width: `${((chapter + 1) / chs.length) * 100}%` }} />
      </div>

      {/* Chapter */}
      {chs.map((ch, ci) => (
        <div key={ci} style={{ display: ci === chapter ? 'block' : 'none' }}>
          <div className="font-display" style={{ fontSize: '0.9rem', color: '#00FFD1', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>
            CH.{ci + 1} — {ch.t}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.35)', marginBottom: '1.3rem', lineHeight: 1.7 }}>{ch.s}</div>

          {ch.fields.map((f, fi) => (
            <div key={fi} style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>
                {f.l.toUpperCase()}
              </label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 80 }}
                placeholder={f.p}
                value={bookData[`${ci}-${fi}`] || ''}
                onChange={e => updateField(ci, fi, e.target.value)}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.1rem' }}>
            {ci > 0 && <button className="btn-sec" style={{ flex: 1 }} onClick={() => setChapter(ci - 1)}>{t('prevChapter', lang)}</button>}
            {ci < chs.length - 1 ? (
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setChapter(ci + 1)}>{t('nextChapter', lang)}</button>
            ) : (
              <button className="btn-primary" style={{ flex: 1 }} onClick={generatePDF}>✦ EXPORT PDF</button>
            )}
          </div>
        </div>
      ))}

      <button className="btn-amber" style={{ marginTop: '1.5rem' }} onClick={generatePDF}>{t('exportPdf', lang)}</button>

      {showPreview && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', color: '#1a1a2e', fontFamily: 'serif', maxHeight: 280, overflowY: 'auto' }}>
            <h1 style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '0.5rem', color: '#0d0d1a' }}>📖 Book of Life — {user?.name}</h1>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#666', marginBottom: '1rem' }}>Written in {new Date().getFullYear()}</p>
            {chs.map((ch, i) => (
              <div key={i}>
                <h2 style={{ fontSize: '0.85rem', margin: '1rem 0 0.3rem', color: '#1a1a4e', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.2rem' }}>{ch.t}</h2>
                {ch.fields.map((f, fi) => {
                  const val = bookData[`${i}-${fi}`];
                  return val ? <p key={fi} style={{ fontSize: '0.75rem', lineHeight: 1.7, color: '#333', marginBottom: '0.4rem' }}><strong>{f.l}:</strong><br />{val}</p> : null;
                })}
              </div>
            ))}
            <div style={{ fontSize: '0.6rem', color: '#999', textAlign: 'center', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
              LegacyChain · A blockchain of love · {new Date().getFullYear()}<br />Written by {user?.name}
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '0.75rem' }} onClick={downloadPDF}>⬇ DOWNLOAD PDF</button>
        </div>
      )}
    </div>
  );
}
