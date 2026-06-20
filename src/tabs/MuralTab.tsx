import { useRef, useState, useEffect, useCallback } from 'react';
import { Download, Redo2, RotateCcw, Save, Trash2, Undo2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import MessageMedia from '@/components/MessageMedia';

type Tool = 'brush' | 'glow' | 'eraser';

const COLORS = ['#00FFD1', '#C084FC', '#FFB347', '#FF6B9D', '#EFF6FF', '#FF2D55'];

export default function MuralTab() {
  const { lang, premium, user, familyName, msgs, setUpgradeOpen } = useStore();
  const familyMedia = msgs.filter(message => message.photo || message.audioUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#00FFD1');
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [historyState, setHistoryState] = useState({ index: -1, count: 0 });

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 20) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    localStorage.setItem(`legacychain-mural-${familyName}`, snapshot);
    setHistoryState({ index: historyIndexRef.current, count: historyRef.current.length });
  }, [familyName]);

  useEffect(() => {
    if (!premium) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = 260;
      if (!canvas.dataset.init) {
        ctx.fillStyle = '#04030A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 80; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 0.8 + 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239,246,255,${Math.random() * 0.3 + 0.05})`;
          ctx.fill();
        }
        canvas.dataset.init = '1';
        const stored = localStorage.getItem(`legacychain-mural-${familyName}`);
        if (stored) {
          const image = new Image();
          image.onload = () => { ctx.drawImage(image, 0, 0, canvas.width, canvas.height); saveSnapshot(); };
          image.src = stored;
        } else {
          saveSnapshot();
        }
      }
    };
    resize();

    const getPos = (e: MouseEvent | TouchEvent) => {
      const r = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0].clientY : e.clientY;
      return { x: cx - r.left, y: cy - r.top };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const p = getPos(e);
      lastPos.current = p;
    };
    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const p = getPos(e);
      const { x, y } = lastPos.current;

      if (tool === 'brush') {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
      } else if (tool === 'eraser') {
        ctx.clearRect(p.x - 10, p.y - 10, 20, 20);
      } else if (tool === 'glow') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
        const hex = color.replace('#', '');
        const rr = parseInt(hex.slice(0, 2), 16), gg = parseInt(hex.slice(2, 4), 16), bb = parseInt(hex.slice(4, 6), 16);
        g.addColorStop(0, `rgba(${rr},${gg},${bb},.35)`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(p.x - 18, p.y - 18, 36, 36);
      }
      lastPos.current = p;
    };
    const end = () => {
      if (isDrawing.current) saveSnapshot();
      isDrawing.current = false;
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseleave', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, [premium, tool, color, familyName, saveSnapshot]);

  const restoreSnapshot = (index: number) => {
    const canvas = canvasRef.current;
    const snapshot = historyRef.current[index];
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      historyIndexRef.current = index;
      setHistoryState({ index, count: historyRef.current.length });
    };
    image.src = snapshot;
  };

  const addText = () => {
    if (!premium) return;
    const txt = prompt(t('addTextPrompt', lang));
    if (!txt) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = "bold 18px 'Cinzel',serif";
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2);
    saveSnapshot();
  };

  const addYear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = "bold 13px 'DM Mono',monospace";
    ctx.fillStyle = 'rgba(0,255,209,0.35)';
    ctx.fillText(new Date().getFullYear().toString(), Math.random() * (canvas.width - 60) + 30, Math.random() * (canvas.height - 30) + 20);
    saveSnapshot();
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `legacychain-mural-${familyName}.png`;
    a.href = canvas.toDataURL();
    a.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#04030A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  };

  if (!premium) {
    return (
      <div>
        <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('navMural', lang)}</div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('muralSub', lang)}</div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,179,71,0.7)', marginBottom: '0.75rem', lineHeight: 1.65 }}>🎨 {t('muralPremiumDesc', lang)}</p>
          <button className="btn-amber" style={{ marginTop: 0 }} onClick={() => setUpgradeOpen(true)}>✦ {t('unlockBtn', lang)}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('navMural', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('muralSub', lang)}</div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <button className="btn-sec" disabled={historyState.index <= 0} onClick={() => restoreSnapshot(historyIndexRef.current - 1)} aria-label="Undo"><Undo2 size={14} /></button>
        <button className="btn-sec" disabled={historyState.index >= historyState.count - 1} onClick={() => restoreSnapshot(historyIndexRef.current + 1)} aria-label="Redo"><Redo2 size={14} /></button>
        {(['brush', 'glow', 'eraser'] as Tool[]).map(tl => (
          <button key={tl} className="btn-sec" style={{ fontSize: '0.62rem', borderColor: tool === tl ? '#00FFD1' : undefined, color: tool === tl ? '#00FFD1' : undefined }} onClick={() => setTool(tl)}>
            {tl === 'brush' ? `✏️ ${t('brush', lang)}` : tl === 'glow' ? `✨ ${t('glow', lang)}` : `⬜ ${t('erase', lang)}`}
          </button>
        ))}
        <button className="btn-sec" style={{ fontSize: '0.62rem' }} onClick={addText}>T {t('textTool', lang)}</button>
        <button className="btn-sec" style={{ fontSize: '0.62rem' }} onClick={addYear}>📅 {t('yearTool', lang)}</button>
        <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.2rem' }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0, border: color === c ? '2px solid #fff' : 'none' }} />
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(0,255,209,0.13)', borderRadius: 12, overflow: 'hidden', touchAction: 'none' }}>
        <canvas ref={canvasRef} style={{ width: '100%', display: 'block', cursor: 'crosshair', touchAction: 'none', height: 260 }} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem' }}>
        <button className="btn-sec" style={{ flex: 1, fontSize: '0.62rem', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '.3rem' }} onClick={saveSnapshot}><Save size={13} /> {t('saveMural', lang)}</button>
        <button className="btn-sec" style={{ flex: 1, fontSize: '0.62rem', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '.3rem' }} onClick={exportPng}><Download size={13} /> {t('exportPng', lang)}</button>
        <button className="btn-sec" style={{ fontSize: '0.62rem' }} onClick={clearCanvas} aria-label={t('clear', lang)}><Trash2 size={13} /></button>
      </div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.18)', textAlign: 'center', marginTop: '0.5rem' }}>
        <RotateCcw size={10} style={{ display: 'inline', marginRight: 4 }} /> {t('muralAutosave', lang)} · {t('signed', lang)} : {user?.first} · {new Date().getFullYear()}
      </div>

      <section className="glass-card" style={{ marginTop: '1rem' }}>
        <div style={{ color: '#00FFD1', fontSize: '.66rem', letterSpacing: '.12em', marginBottom: '.3rem' }}>{t('familyMediaGallery', lang)}</div>
        <p style={{ color: 'rgba(239,246,255,.38)', fontSize: '.54rem', lineHeight: 1.6, margin: '0 0 .8rem' }}>{t('familyMediaGalleryDesc', lang)}</p>
        {familyMedia.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.65rem' }}>
            {familyMedia.map(message => (
              <article key={message.id} style={{ padding: '.65rem', borderRadius: 10, background: 'rgba(0,255,209,.025)', border: '1px solid rgba(0,255,209,.12)' }}>
                <div style={{ color: 'rgba(239,246,255,.7)', fontSize: '.6rem' }}>{message.a} · {message.y}</div>
                <MessageMedia message={message} lang={lang} />
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(239,246,255,.28)', fontSize: '.58rem', border: '1px dashed rgba(0,255,209,.14)', borderRadius: 9 }}>{t('noFamilyMedia', lang)}</div>
        )}
      </section>
    </div>
  );
}
