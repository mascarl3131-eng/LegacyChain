import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { COORD_MAP, CHART_COLORS, DNA_SERVICES } from '@/lib/data';

export default function OriginsTab() {
  const { lang, user, originRows, setOriginRows, pacte, setPacte, showNotif } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [tabActive, setTabActive] = useState(true);

  const total = originRows.reduce((s, r) => s + r.p, 0);
  const totalStatus = total === 100 ? 'ok' : total < 100 ? 'low' : 'over';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setTabActive(e.isIntersecting));
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth || 400;
    canvas.height = 260;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 12;
    let rot = 0;

    const data = originRows.filter(o => o.p > 0 && o.c);

    function project(lat: number, lng: number, rotation: number) {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + rotation) * Math.PI / 180;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return { x: cx + x, y: cy - y, z, visible: z > 0 };
    }

    function draw() {
      if (!tabActive) { animRef.current = requestAnimationFrame(draw); return; }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const g = ctx!.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
      g.addColorStop(0, 'rgba(30,180,255,0.7)');
      g.addColorStop(0.5, 'rgba(0,100,200,0.55)');
      g.addColorStop(1, 'rgba(0,20,60,0.85)');
      ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2); ctx!.fillStyle = g; ctx!.fill();

      ctx!.strokeStyle = 'rgba(150,230,255,0.3)'; ctx!.lineWidth = 0.7;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx!.beginPath(); let first = true;
        for (let lng = -180; lng <= 180; lng += 5) {
          const p = project(lat, lng, rot);
          if (p.visible) { if (first) { ctx!.moveTo(p.x, p.y); first = false; } else ctx!.lineTo(p.x, p.y); }
        }
        ctx!.stroke();
      }
      for (let lng = 0; lng < 360; lng += 30) {
        ctx!.beginPath(); let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const p = project(lat, lng, rot);
          if (p.visible) { if (first) { ctx!.moveTo(p.x, p.y); first = false; } else ctx!.lineTo(p.x, p.y); }
        }
        ctx!.stroke();
      }

      ctx!.strokeStyle = 'rgba(180,240,255,0.4)'; ctx!.lineWidth = 1.2;
      ctx!.beginPath(); let ef = true;
      for (let lng = -180; lng <= 180; lng += 3) {
        const p = project(0, lng, rot);
        if (p.visible) { if (ef) { ctx!.moveTo(p.x, p.y); ef = false; } else ctx!.lineTo(p.x, p.y); }
      }
      ctx!.stroke();

      data.forEach((o, i) => {
        const coords = COORD_MAP[o.c] || [0, -rot];
        const p = project(coords[0], coords[1], rot);
        if (p.visible) {
          const sz = Math.max(5, o.p / 7);
          const col = CHART_COLORS[i % CHART_COLORS.length];
          const hex = col.replace('#', '');
          const rr = parseInt(hex.slice(0, 2), 16), gg = parseInt(hex.slice(2, 4), 16), bb = parseInt(hex.slice(4, 6), 16);

          ctx!.beginPath(); ctx!.arc(p.x, p.y, sz * 2.2, 0, Math.PI * 2);
          const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 2.2);
          glow.addColorStop(0, `rgba(${rr},${gg},${bb},.4)`); glow.addColorStop(1, 'transparent');
          ctx!.fillStyle = glow; ctx!.fill();

          ctx!.beginPath(); ctx!.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx!.fillStyle = col; ctx!.fill();

          ctx!.fillStyle = 'rgba(239,246,255,0.85)'; ctx!.font = 'bold 8px "DM Mono",monospace'; ctx!.textAlign = 'center';
          ctx!.fillText(`${o.c} ${o.p}%`, p.x, p.y - sz - 5);
        }
      });

      const shine = ctx!.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.7);
      shine.addColorStop(0, 'rgba(150,220,255,.09)'); shine.addColorStop(1, 'transparent');
      ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2); ctx!.fillStyle = shine; ctx!.fill();

      ctx!.strokeStyle = 'rgba(100,180,255,0.25)'; ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2); ctx!.stroke();

      rot += 0.25;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [tabActive, originRows]);

  const addRow = () => setOriginRows([...originRows, { c: '', p: 0 }]);
  const updateRow = (i: number, field: 'c' | 'p', val: string) => {
    const updated = [...originRows];
    updated[i] = { ...updated[i], [field]: field === 'p' ? parseInt(val) || 0 : val };
    setOriginRows(updated);
  };
  const removeRow = (i: number) => setOriginRows(originRows.filter((_, j) => j !== i));

  const signPacte = () => {
    if (pacte) return;
    setPacte(true);
    showNotif('🛡 You are now a Guardian of the Chain', '#00FFD1');
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('originsTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('originsSub', lang)}</div>

      <div style={{ border: '1px solid rgba(255,179,71,0.32)', background: 'rgba(255,179,71,0.05)', borderRadius: 8, padding: '0.9rem', marginBottom: '1.3rem', fontSize: '0.7rem', lineHeight: 1.7, color: 'rgba(255,179,71,0.72)' }}>
        <strong style={{ color: '#FFB347', display: 'block', marginBottom: '0.22rem' }}>{t('dnaWarnTitle', lang)}</strong>
        <span>{t('dnaWarnText', lang)}</span>
      </div>

      {originRows.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.4rem' }}>
          <input type="text" className="form-input" style={{ flex: 1 }} placeholder="Country" value={row.c} onChange={e => updateRow(i, 'c', e.target.value)} />
          <input type="number" className="form-input" style={{ width: 60 }} placeholder="%" value={row.p || ''} min={0} max={100} onChange={e => updateRow(i, 'p', e.target.value)} />
          <span style={{ color: '#00FFD1', fontSize: '0.78rem', flexShrink: 0 }}>%</span>
          <button onClick={() => removeRow(i)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,45,85,0.45)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
        </div>
      ))}

      <button className="btn-sec" style={{ marginTop: '0.4rem', fontSize: '0.62rem' }} onClick={addRow}>{t('addOrigin', lang)}</button>

      <div className={`t-${totalStatus}`} style={{
        marginTop: '0.8rem', padding: '0.6rem', borderRadius: 6, fontSize: '0.7rem', textAlign: 'center',
        background: totalStatus === 'ok' ? 'rgba(0,255,209,0.07)' : totalStatus === 'low' ? 'rgba(255,179,71,0.07)' : 'rgba(255,45,85,0.07)',
        border: `1px solid ${totalStatus === 'ok' ? 'rgba(0,255,209,0.18)' : totalStatus === 'low' ? 'rgba(255,179,71,0.18)' : 'rgba(255,45,85,0.18)'}`,
        color: totalStatus === 'ok' ? '#00FFD1' : totalStatus === 'low' ? '#FFB347' : '#FF2D55',
      }}>
        {totalStatus === 'ok' ? t('totalOk', lang) : totalStatus === 'low' ? `${t('totalLow', lang)} (${total}%)` : `${t('totalOver', lang)} (${total}%)`}
      </div>

      <div style={{ width: '100%', height: 260, position: 'relative', borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,209,0.13)', marginTop: '1.5rem' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: '0.6rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.58rem', color: 'rgba(0,255,209,0.35)', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
          {t('notCertified', lang)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {originRows.filter(o => o.p > 0 && o.c).map((o, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1rem', color: CHART_COLORS[i % CHART_COLORS.length] }}>{o.p}%</strong>
            <span style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.32)', letterSpacing: '0.08em' }}>{o.c}</span>
          </div>
        ))}
      </div>

      {/* DNA Services */}
      <div style={{ background: 'rgba(0,255,209,0.03)', border: '1px solid rgba(0,255,209,0.1)', borderRadius: 10, padding: '1rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,209,0.6)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>🧬 DISCOVER YOUR TRUE ORIGINS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {DNA_SERVICES.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '0.6rem 0.75rem', display: 'block', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,209,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              <div style={{ fontSize: '0.62rem', color: '#EFF6FF', fontWeight: 500, marginBottom: '0.2rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.56rem', color: 'rgba(239,246,255,0.35)', lineHeight: 1.4 }}>{s.desc}</div>
            </a>
          ))}
        </div>
        <div style={{ fontSize: '0.55rem', color: 'rgba(239,246,255,0.2)', textAlign: 'center', marginTop: '0.75rem', letterSpacing: '0.06em' }}>Only a certified DNA test is 100% reliable · manual entries are estimates</div>
      </div>

      {/* Family Pact */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,255,209,0.04),rgba(192,132,252,0.04))', border: '1px solid rgba(0,255,209,0.16)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>{t('pacteTitle', lang)}</div>
        <p style={{ fontStyle: 'italic', fontSize: '0.78rem', lineHeight: 1.95, color: 'rgba(239,246,255,0.62)', marginBottom: '1.2rem' }}>
          {t('commitLegacy', lang)} {t('yourChildren', lang)} {t('age60', lang)}.
        </p>
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 Marie · 2024</span>
          <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 Robert · 2024</span>
          {pacte && user && (
            <span style={{ fontSize: '0.63rem', color: '#00FFD1', background: 'rgba(0,255,209,0.08)', border: '1px solid rgba(0,255,209,0.16)', padding: '0.22rem 0.6rem', borderRadius: 20 }}>🛡 {user.first} · {new Date().getFullYear()}</span>
          )}
        </div>
        <button className="btn-primary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={signPacte}>{t('signPacte', lang)}</button>
      </div>
    </div>
  );
}
