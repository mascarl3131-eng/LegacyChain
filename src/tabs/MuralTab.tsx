import { useRef, useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

type Tool = 'brush' | 'glow' | 'eraser';

const COLORS = ['#00FFD1', '#C084FC', '#FFB347', '#FF6B9D', '#EFF6FF', '#FF2D55'];

export default function MuralTab() {
  const { lang, premium, user, familyName, setUpgradeOpen } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#00FFD1');
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

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
    const end = () => { isDrawing.current = false; };

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
  }, [premium, tool, color]);

  const addText = () => {
    if (!premium) return;
    const txt = prompt('Add text to the mural:');
    if (!txt) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = "bold 18px 'Cinzel',serif";
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2);
  };

  const addYear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = "bold 13px 'DM Mono',monospace";
    ctx.fillStyle = 'rgba(0,255,209,0.35)';
    ctx.fillText(new Date().getFullYear().toString(), Math.random() * (canvas.width - 60) + 30, Math.random() * (canvas.height - 30) + 20);
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
  };

  if (!premium) {
    return (
      <div>
        <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('navMural', lang)}</div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Collaborative canvas for your family</div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,179,71,0.7)', marginBottom: '0.75rem', lineHeight: 1.65 }}>🎨 Family Mural is a premium feature. Draw, write and build your family's collaborative artwork together.</p>
          <button className="btn-amber" style={{ marginTop: 0 }} onClick={() => setUpgradeOpen(true)}>✦ {t('unlockBtn', lang)}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('navMural', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Collaborative canvas — draw together across time</div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        {(['brush', 'glow', 'eraser'] as Tool[]).map(tl => (
          <button key={tl} className="btn-sec" style={{ fontSize: '0.62rem', borderColor: tool === tl ? '#00FFD1' : undefined, color: tool === tl ? '#00FFD1' : undefined }} onClick={() => setTool(tl)}>
            {tl === 'brush' ? '✏️ BRUSH' : tl === 'glow' ? '✨ GLOW' : '⬜ ERASE'}
          </button>
        ))}
        <button className="btn-sec" style={{ fontSize: '0.62rem' }} onClick={addText}>T TEXT</button>
        <button className="btn-sec" style={{ fontSize: '0.62rem' }} onClick={addYear}>📅 YEAR</button>
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
        <button className="btn-sec" style={{ flex: 1, fontSize: '0.62rem' }} onClick={exportPng}>⬇ EXPORT PNG</button>
        <button className="btn-sec" style={{ flex: 1, fontSize: '0.62rem' }} onClick={clearCanvas}>🗑 CLEAR</button>
      </div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.18)', textAlign: 'center', marginTop: '0.5rem' }}>
        Signed: {user?.first} · {new Date().getFullYear()}
      </div>
    </div>
  );
}
