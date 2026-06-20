import { useMemo, useRef, useState } from 'react';
import { Focus, List, Maximize2, MessageCircle, Network, Plus, Search, UserRound, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { TREE_LINKS } from '@/lib/data';
import type { TreeNode } from '@/lib/data';

const GEN_COLORS = ['#C084FC', '#00FFD1', '#FFB347'];
const GEN_Y = [70, 190, 310];

export default function TreeTab() {
  const { lang, msgs, treeNodes, setTreeNodes } = useStore();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<[number, number][]>(TREE_LINKS);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [generation, setGeneration] = useState<'all' | number>('all');
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [by, setBy] = useState('');
  const [rel, setRel] = useState('child');
  const [relativeTo, setRelativeTo] = useState(treeNodes[3]?.id || treeNodes[0]?.id || 0);

  const selectedMem = treeNodes.find(node => node.id === selectedId) || null;
  const visibleNodes = useMemo(() => treeNodes.filter(node => {
    const matchesGeneration = generation === 'all' || node.gen === generation;
    const matchesQuery = node.n.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return matchesGeneration && matchesQuery;
  }), [generation, query, treeNodes]);
  const visibleIds = new Set(visibleNodes.map(node => node.id));

  const getNodeMsgs = (name: string) => msgs.filter(message => message.a === name.split(' ')[0]);
  const generationLabel = (gen: number) => t(['genGrandparents', 'genParents', 'genChildren'][gen], lang);

  const addMember = () => {
    if (!fn.trim()) return;
    const reference = treeNodes.find(node => node.id === relativeTo) || treeNodes[0];
    let gen = reference?.gen ?? 1;
    if (rel === 'parent') gen = Math.max(0, gen - 1);
    if (rel === 'grandparent') gen = 0;
    if (rel === 'child') gen = Math.min(2, gen + 1);

    const sameGeneration = treeNodes.filter(node => node.gen === gen);
    const id = Math.max(0, ...treeNodes.map(node => node.id)) + 1;
    const newNode: TreeNode = {
      id,
      n: `${fn.trim()} ${ln.trim() || reference?.n.split(' ').slice(1).join(' ') || 'Doe'}`,
      b: parseInt(by) || new Date().getFullYear(),
      x: 110 + sameGeneration.length * 145,
      y: GEN_Y[gen],
      gen,
    };

    setTreeNodes([...treeNodes, newNode]);
    if (reference) {
      setLinks(current => [...current, rel === 'parent' || rel === 'grandparent' ? [id, reference.id] : [reference.id, id]]);
    }
    setFn('');
    setLn('');
    setBy('');
    setShowAdd(false);
    setSelectedId(id);
  };

  const resetView = () => {
    setZoom(1);
    setGeneration('all');
    setQuery('');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('treeTitle', lang)}</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>{t('treeSub', lang)}</div>
        </div>
        <div style={{ color: 'rgba(239,246,255,0.35)', fontSize: '0.55rem', textAlign: 'right', lineHeight: 1.6 }}>
          <strong style={{ color: '#00FFD1', fontSize: '0.72rem' }}>{treeNodes.length}</strong> {t('membersCount', lang)}<br />
          3 {t('generationsCount', lang)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 170px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'rgba(239,246,255,0.3)' }} />
          <input className="form-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchMember', lang)} style={{ paddingLeft: 32, minHeight: 36 }} />
        </div>
        <button className="btn-sec" onClick={() => setView(view === 'tree' ? 'list' : 'tree')} style={{ minHeight: 36, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {view === 'tree' ? <List size={14} /> : <Network size={14} />} {view === 'tree' ? t('listView', lang) : t('treeView', lang)}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.55rem', overflowX: 'auto', paddingBottom: 3 }}>
        {(['all', 0, 1, 2] as const).map(item => {
          const active = generation === item;
          return (
            <button key={item} className="btn-sec" onClick={() => setGeneration(item)} style={{ whiteSpace: 'nowrap', borderColor: active ? (item === 'all' ? '#00FFD1' : GEN_COLORS[item]) : undefined, color: active ? (item === 'all' ? '#00FFD1' : GEN_COLORS[item]) : undefined }}>
              {item === 'all' ? t('allGenerations', lang) : generationLabel(item)}
            </button>
          );
        })}
      </div>

      {view === 'tree' ? (
        <div ref={viewportRef} className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '0.75rem', position: 'relative' }}>
          <div className="desktop-zoom-controls" style={{ position: 'absolute', zIndex: 3, top: 9, right: 9, display: 'flex', gap: 5 }}>
            <button className="btn-sec" onClick={() => setZoom(value => Math.min(1.55, value + 0.12))} style={{ width: 32, height: 32, padding: 0 }} aria-label="Zoom in"><ZoomIn size={14} /></button>
            <button className="btn-sec" onClick={() => setZoom(value => Math.max(0.72, value - 0.12))} style={{ width: 32, height: 32, padding: 0 }} aria-label="Zoom out"><ZoomOut size={14} /></button>
            <button className="btn-sec" onClick={resetView} style={{ width: 32, height: 32, padding: 0 }} aria-label="Reset"><Focus size={14} /></button>
            <button className="btn-sec" onClick={() => void viewportRef.current?.requestFullscreen()} style={{ width: 32, height: 32, padding: 0 }} aria-label="Fullscreen"><Maximize2 size={14} /></button>
          </div>

          <div style={{ overflow: 'auto', minHeight: 390 }}>
            <div style={{ width: 700, height: 390, transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform .2s ease' }}>
              <svg viewBox="0 0 700 390" width="700" height="390" style={{ display: 'block' }}>
                {links.map(([from, to], index) => {
                  const a = treeNodes.find(node => node.id === from);
                  const b = treeNodes.find(node => node.id === to);
                  if (!a || !b || !visibleIds.has(a.id) || !visibleIds.has(b.id)) return null;
                  const ax = a.x + 55;
                  const bx = b.x + 55;
                  return <path key={index} d={`M${ax},${a.y + 32} C${ax},${(a.y + b.y) / 2} ${bx},${(a.y + b.y) / 2} ${bx},${b.y - 32}`} fill="none" stroke="rgba(0,255,209,0.28)" strokeWidth="1.4" />;
                })}
              </svg>

              {visibleNodes.map(node => {
                const color = GEN_COLORS[node.gen];
                const nodeMsgs = getNodeMsgs(node.n);
                const active = selectedId === node.id;
                return (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    style={{
                      position: 'absolute', left: node.x, top: node.y - 32, width: 110, minHeight: 64,
                      borderRadius: 12, border: `1px solid ${active ? color : `${color}66`}`,
                      background: active ? `${color}18` : 'rgba(4,3,10,0.92)', color: '#EFF6FF',
                      boxShadow: active ? `0 0 20px ${color}22` : 'none', cursor: 'pointer', padding: '0.55rem',
                      fontFamily: "'DM Mono',monospace", textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, color, flexShrink: 0 }}><UserRound size={15} /></span>
                      <span style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.63rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.n.split(' ')[0]}</strong>
                        <small style={{ color: 'rgba(239,246,255,0.36)', fontSize: '0.52rem' }}>{node.b}</small>
                      </span>
                    </span>
                    {nodeMsgs.length > 0 && <span style={{ position: 'absolute', right: 6, top: 6, minWidth: 17, height: 17, borderRadius: 9, background: '#00FFD1', color: '#04030A', fontSize: '0.48rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{nodeMsgs.length}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
          {visibleNodes.map(node => (
            <button key={node.id} type="button" onClick={() => setSelectedId(node.id)} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', color: '#EFF6FF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <UserRound size={18} color={GEN_COLORS[node.gen]} />
                <span><strong style={{ display: 'block', fontSize: '0.7rem' }}>{node.n}</strong><small style={{ color: 'rgba(239,246,255,0.35)' }}>{generationLabel(node.gen)} · {node.b}</small></span>
              </span>
              <span style={{ fontSize: '0.56rem', color: '#00FFD1' }}>{getNodeMsgs(node.n).length} {t('messages', lang)}</span>
            </button>
          ))}
        </div>
      )}

      <button className="btn-primary" style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }} onClick={() => setShowAdd(true)}>
        <Plus size={15} /> {t('addMember', lang).replace('+ ', '')}
      </button>

      {showAdd && (
        <div className="glass-card" style={{ marginTop: '0.9rem', position: 'relative' }}>
          <button type="button" onClick={() => setShowAdd(false)} style={{ position: 'absolute', right: 10, top: 10, border: 0, background: 'transparent', color: 'rgba(239,246,255,.4)', cursor: 'pointer' }}><X size={16} /></button>
          <div style={{ color: '#00FFD1', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: '0.8rem' }}>{t('addMember', lang).replace('+ ', '')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <input type="text" className="form-input" value={fn} onChange={event => setFn(event.target.value)} placeholder={t('firstName', lang)} />
            <input type="text" className="form-input" value={ln} onChange={event => setLn(event.target.value)} placeholder={t('lastName', lang)} />
            <input type="number" className="form-input" value={by} onChange={event => setBy(event.target.value)} placeholder={t('birthYear', lang)} min="1850" max={new Date().getFullYear()} />
            <select className="form-select" value={rel} onChange={event => setRel(event.target.value)}>
              {['parent', 'child', 'sibling', 'grandparent', 'partner'].map(relation => <option key={relation} value={relation}>{t(relation, lang)}</option>)}
            </select>
          </div>
          <label style={{ display: 'block', fontSize: '0.57rem', color: 'rgba(239,246,255,.35)', margin: '0.7rem 0 0.3rem' }}>{t('relativeTo', lang)}</label>
          <select className="form-select" value={relativeTo} onChange={event => setRelativeTo(Number(event.target.value))}>
            {treeNodes.map(node => <option key={node.id} value={node.id}>{node.n}</option>)}
          </select>
          <button className="btn-primary" onClick={addMember}>{t('addToTree', lang)}</button>
        </div>
      )}

      {selectedMem && (
        <div className="glass-card" style={{ marginTop: '0.9rem', borderColor: `${GEN_COLORS[selectedMem.gen]}55` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${GEN_COLORS[selectedMem.gen]}18`, color: GEN_COLORS[selectedMem.gen] }}><UserRound size={19} /></span>
              <div><strong style={{ display: 'block', color: '#EFF6FF', fontSize: '0.75rem' }}>{selectedMem.n}</strong><small style={{ color: 'rgba(239,246,255,.35)' }}>{generationLabel(selectedMem.gen)} · {selectedMem.b}</small></div>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} style={{ border: 0, background: 'transparent', color: 'rgba(239,246,255,.4)', cursor: 'pointer' }}><X size={16} /></button>
          </div>
          {getNodeMsgs(selectedMem.n).length ? getNodeMsgs(selectedMem.n).map(message => (
            <div key={message.id} style={{ padding: '0.7rem 0', borderTop: '1px solid rgba(0,255,209,0.13)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.56rem', color: '#00FFD1', marginBottom: '0.3rem' }}><MessageCircle size={12} /> {message.y}</div>
              <div style={{ fontSize: '0.65rem', lineHeight: 1.65, color: 'rgba(239,246,255,0.72)' }}>{message.text}</div>
            </div>
          )) : <div style={{ fontSize: '0.65rem', color: 'rgba(239,246,255,0.3)', paddingTop: '0.4rem' }}>{t('noMessages', lang)}</div>}
        </div>
      )}
    </div>
  );
}
