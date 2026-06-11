import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { TREE_LINKS } from '@/lib/data';
import type { TreeNode } from '@/lib/data';

const GEN_COLORS = ['#C084FC', '#00FFD1', '#FFB347'];
const GEN_LABELS = ['GRANDPARENTS', 'PARENTS', 'CHILDREN'];

export default function TreeTab() {
  const { lang, msgs, treeNodes, setTreeNodes } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMem, setSelectedMem] = useState<TreeNode | null>(null);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [by, setBy] = useState('');
  const [rel, setRel] = useState('child');
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgW, setSvgW] = useState(520);

  useEffect(() => {
    const updateW = () => {
      const w = svgRef.current?.parentElement?.offsetWidth || 520;
      setSvgW(Math.min(w, 600));
    };
    updateW();
    window.addEventListener('resize', updateW);
    return () => window.removeEventListener('resize', updateW);
  }, []);

  const H = 340;
  const scaled = treeNodes.map(n => ({
    ...n,
    x: n.x * (svgW / 600),
    y: n.y * (H / 340),
  }));

  const addMember = () => {
    if (!fn.trim()) return;
    const newNode: TreeNode = {
      id: Math.max(...treeNodes.map(t => t.id)) + 1,
      n: `${fn.trim()} ${ln.trim() || 'Doe'}`,
      b: parseInt(by) || new Date().getFullYear(),
      x: 50 + Math.random() * 480,
      y: 340,
      gen: 2,
    };
    setTreeNodes([...treeNodes, newNode]);
    setFn(''); setLn(''); setBy(''); setShowAdd(false);
  };

  const getNodeMsgs = (name: string) => msgs.filter(m => m.a === name.split(' ')[0]);

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('treeTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('treeSub', lang)}</div>

      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <svg ref={svgRef} viewBox={`0 0 ${svgW} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <filter id="glow-v" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {[0, 1, 2].map(g => (
            <text key={g} x={6} y={[55, 165, 278][g] + 4} fontFamily="'DM Mono',monospace" fontSize={6} fill={GEN_COLORS[g]} opacity={0.4} letterSpacing={1}>{GEN_LABELS[g]}</text>
          ))}

          {TREE_LINKS.map(([a, b], li) => {
            const A = scaled.find(n => n.id === a);
            const B = scaled.find(n => n.id === b);
            if (!A || !B) return null;
            const mx = (A.x + B.x) / 2;
            return (
              <g key={li}>
                <path d={`M${A.x},${A.y} Q${mx},${(A.y + B.y) / 2} ${B.x},${B.y}`} fill="none" stroke={`url(#grad-${li})`} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="4,4" opacity={0.7}>
                  <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite" />
                </path>
                <defs><linearGradient id={`grad-${li}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={GEN_COLORS[A.gen]} stopOpacity={0.6} /><stop offset="100%" stopColor={GEN_COLORS[B.gen]} stopOpacity={0.6} /></linearGradient></defs>
              </g>
            );
          })}

          {scaled.map(m => {
            const col = GEN_COLORS[m.gen];
            const nodeMsgs = getNodeMsgs(m.n);
            const hasMsg = nodeMsgs.length > 0;
            const r = hasMsg ? 30 : 24;
            const firstName = m.n.split(' ')[0];

            return (
              <g key={m.id} onClick={() => { setSelectedMem(m); }} style={{ cursor: 'pointer' }}>
                <circle cx={m.x} cy={m.y} r={r + 18} fill={col} opacity={hasMsg ? 0.15 : 0.05}>
                  {hasMsg && <><animate attributeName="r" values={`${r + 14};${r + 22};${r + 14}`} dur="3s" repeatCount="indefinite" /><animate attributeName="opacity" values=".7;.3;.7" dur="3s" repeatCount="indefinite" /></>}
                </circle>
                <circle cx={m.x} cy={m.y} r={r} fill="rgba(4,3,10,0.85)" stroke={col} strokeWidth={hasMsg ? 2 : 1.5} filter={hasMsg ? 'url(#glow-v)' : undefined} />
                <circle cx={m.x} cy={m.y} r={r - 6} fill="none" stroke={col} strokeWidth={0.5} opacity={0.3} strokeDasharray="3,3" />
                <circle cx={m.x} cy={m.y - 4} r={9} fill={col} opacity={0.15} />
                <text x={m.x} y={m.y - 1} textAnchor="middle" dominantBaseline="middle" fontFamily="'Cinzel',serif" fontSize={9} fontWeight={600} fill={col} filter={hasMsg ? 'url(#glow-v)' : undefined}>{firstName[0]}</text>
                <text x={m.x} y={m.y + 11} textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize={7.5} fontWeight={500} fill="#EFF6FF" opacity={0.9}>{firstName}</text>
                <rect x={m.x - 14} y={m.y + r + 2} width={28} height={11} rx={5} fill={col} opacity={0.12} stroke={col} strokeWidth={0.5} strokeOpacity={0.4} />
                <text x={m.x} y={m.y + r + 9} textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize={6.5} fill={col} opacity={0.8}>{m.b}</text>
                {hasMsg && (
                  <>
                    <circle cx={m.x + r - 4} cy={m.y - r + 4} r={5} fill="#00FFD1" filter="url(#glow-v)">
                      <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x={m.x + r - 4} y={m.y - r + 8} textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize={5.5} fill="#04030A" fontWeight={700}>{nodeMsgs.length}</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <button className="btn-sec" style={{ marginTop: '0.9rem' }} onClick={() => setShowAdd(!showAdd)}>{t('addMember', lang)}</button>

      {showAdd && (
        <div className="glass-card" style={{ marginTop: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('firstName', lang)}</label>
              <input type="text" className="form-input" value={fn} onChange={e => setFn(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('lastName', lang)}</label>
              <input type="text" className="form-input" value={ln} onChange={e => setLn(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('birthYear', lang)}</label>
              <input type="number" className="form-input" value={by} onChange={e => setBy(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('relation', lang)}</label>
              <select className="form-select" value={rel} onChange={e => setRel(e.target.value)}>
                {['parent', 'child', 'sibling', 'grandparent', 'partner'].map(r => (
                  <option key={r} value={r}>{t(r, lang)}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={addMember}>{t('addToTree', lang)}</button>
        </div>
      )}

      {selectedMem && (
        <div className="glass-card" style={{ marginTop: '0.9rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#00FFD1', letterSpacing: '0.12em', marginBottom: '0.9rem' }}>
            {selectedMem.n} · {getNodeMsgs(selectedMem.n).length} message{getNodeMsgs(selectedMem.n).length !== 1 ? 's' : ''}
          </div>
          <div>
            {getNodeMsgs(selectedMem.n).length ? getNodeMsgs(selectedMem.n).map(msg => (
              <div key={msg.id} style={{ padding: '0.7rem 0', borderTop: '1px solid rgba(0,255,209,0.13)' }}>
                <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.3)', marginBottom: '0.3rem' }}>{msg.e.toUpperCase()} · {msg.y}</div>
                <div style={{ fontSize: '0.65rem', lineHeight: 1.65, color: 'rgba(239,246,255,0.88)' }}>{msg.text}</div>
              </div>
            )) : (
              <div style={{ fontSize: '0.72rem', color: 'rgba(239,246,255,0.28)', padding: '0.8rem 0' }}>No messages yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
