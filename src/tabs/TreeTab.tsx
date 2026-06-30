import { useEffect, useMemo, useRef, useState } from 'react';
import { Focus, List, Maximize2, MessageCircle, Network, Plus, Search, UserRound, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { TREE_LINKS } from '@/lib/data';
import type { TreeNode } from '@/lib/data';
import MessageMedia from '@/components/MessageMedia';

const GEN_COLORS = ['#C084FC', '#00FFD1', '#FFB347'];
const GEN_Y = [70, 190, 310];
const DEMO_TREE_NAMES = ['Robert Doe', 'Irène Doe', 'Jean Doe', 'Marie Doe', 'Sophie Doe', 'Lucas Doe'];

export default function TreeTab() {
  const { lang, msgs, treeNodes, setTreeNodes, session, activeFamilyId, showNotif } = useStore();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasScrollerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ active: false, pointerId: -1, x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1 });
  const [links, setLinks] = useState<[number, number][]>(TREE_LINKS);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [generation, setGeneration] = useState<'all' | number>('all');
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [by, setBy] = useState('');
  const [rel, setRel] = useState('child');
  const [relativeTo, setRelativeTo] = useState(treeNodes[3]?.id || treeNodes[0]?.id || 0);
  const [editFn, setEditFn] = useState('');
  const [editLn, setEditLn] = useState('');
  const [editBy, setEditBy] = useState('');
  const [editRel, setEditRel] = useState('child');
  const [editRelativeTo, setEditRelativeTo] = useState(0);
  const [cloudReady, setCloudReady] = useState(false);
  const isDemoTree = treeNodes.length === DEMO_TREE_NAMES.length && treeNodes.every(node => DEMO_TREE_NAMES.includes(node.n));

  const selectedMem = treeNodes.find(node => node.id === selectedId) || null;
  const visibleNodes = useMemo(() => treeNodes.filter(node => {
    const matchesGeneration = generation === 'all' || node.gen === generation;
    const matchesQuery = node.n.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    return matchesGeneration && matchesQuery;
  }), [generation, query, treeNodes]);
  const visibleIds = new Set(visibleNodes.map(node => node.id));
  const layout = useMemo(() => {
    const groups = new Map<number, TreeNode[]>();
    treeNodes.forEach(node => {
      const items = groups.get(node.gen) || [];
      items.push(node);
      groups.set(node.gen, items);
    });

    const positions = new Map<number, { x: number; y: number }>();
    let canvasWidth = 700;

    [0, 1, 2].forEach(gen => {
      const items = (groups.get(gen) || []).slice().sort((a, b) => a.b - b.b || a.n.localeCompare(b.n) || a.id - b.id);
      const cardWidth = 120;
      const gap = 52;
      const totalWidth = items.length ? (items.length * cardWidth) + ((items.length - 1) * gap) : 0;
      canvasWidth = Math.max(canvasWidth, totalWidth + 140);
      const startX = Math.max(50, (canvasWidth - totalWidth) / 2);
      items.forEach((node, index) => {
        positions.set(node.id, {
          x: Math.round(startX + index * (cardWidth + gap)),
          y: GEN_Y[gen] - 32,
        });
      });
    });

    return {
      positions,
      canvasWidth: Math.max(700, canvasWidth),
      canvasHeight: 390,
    };
  }, [treeNodes]);

  const getNodeMsgs = (name: string) => msgs.filter(message => message.a === name.split(' ')[0]);
  const generationLabel = (gen: number) => t(['genGrandparents', 'genParents', 'genChildren'][gen], lang);

  const getRelationMeta = (memberId: number) => {
    const outgoing = links.find(([from]) => from === memberId);
    const incoming = links.find(([, to]) => to === memberId);
    if (outgoing) {
      const referenceId = outgoing[1];
      const member = treeNodes.find(node => node.id === memberId);
      const reference = treeNodes.find(node => node.id === referenceId);
      if (member && reference) {
        const gap = reference.gen - member.gen;
        if (gap >= 2) return { relation: 'grandparent', referenceId };
        if (gap === 1) return { relation: 'parent', referenceId };
        if (gap === 0) return { relation: 'sibling', referenceId };
      }
      return { relation: 'parent', referenceId };
    }
    if (incoming) {
      const referenceId = incoming[0];
      const member = treeNodes.find(node => node.id === memberId);
      const reference = treeNodes.find(node => node.id === referenceId);
      if (member && reference) {
        const gap = member.gen - reference.gen;
        if (gap >= 1) return { relation: 'child', referenceId };
        if (gap === 0) return { relation: 'sibling', referenceId };
      }
      return { relation: 'child', referenceId };
    }
    const fallback = treeNodes.find(node => node.id !== memberId)?.id || 0;
    return { relation: 'child', referenceId: fallback };
  };

  const buildNodeDraft = (memberId: number, relation: string, referenceId: number, firstName: string, lastName: string, birthYear: string) => {
    const current = treeNodes.find(node => node.id === memberId);
    const reference = treeNodes.find(node => node.id === referenceId && node.id !== memberId) || null;
    let gen = current?.gen ?? 1;
    if (reference) {
      gen = reference.gen;
      if (relation === 'parent') gen = Math.max(0, reference.gen - 1);
      if (relation === 'grandparent') gen = 0;
      if (relation === 'child') gen = Math.min(2, reference.gen + 1);
      if (relation === 'sibling' || relation === 'partner') gen = reference.gen;
    }
    return {
      reference,
      node: {
        id: memberId,
        n: `${firstName.trim()} ${lastName.trim()}`.trim(),
        b: parseInt(birthYear, 10) || current?.b || new Date().getFullYear(),
        x: current?.x || 0,
        y: current?.y || GEN_Y[gen],
        gen,
      } as TreeNode,
    };
  };

  const persistTree = async (nextNodes: TreeNode[], nextLinks: [number, number][]) => {
    if (!session?.access_token || !activeFamilyId) return;
    try {
      const response = await fetch('/api/family-tree', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: activeFamilyId,
          nodes: nextNodes,
          links: nextLinks,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Family tree sync failed');
      }
      setCloudReady(true);
    } catch (error) {
      console.error('Family tree sync:', error);
      showNotif(lang === 'fr' ? "Erreur de synchro de l'arbre familial" : 'Family tree sync error', '#FF6B6B');
    }
  };

  useEffect(() => {
    if (!session?.access_token || !activeFamilyId) return;
    let active = true;
    const loadTree = async () => {
      try {
        const response = await fetch(`/api/family-tree?familyId=${encodeURIComponent(activeFamilyId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !active) return;
        if (Array.isArray(data.nodes) && data.nodes.length) {
          setTreeNodes(data.nodes);
          setLinks(Array.isArray(data.links) ? data.links : []);
          setRelativeTo((current) => current || data.nodes[0]?.id || 0);
        }
        setCloudReady(true);
      } catch {
        if (active) setCloudReady(false);
      }
    };

    void loadTree();
    const timer = window.setInterval(() => void loadTree(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [activeFamilyId, session?.access_token, setTreeNodes]);

  useEffect(() => {
    if (selectedId && !treeNodes.some(node => node.id === selectedId)) setSelectedId(null);
    if (relativeTo && !treeNodes.some(node => node.id === relativeTo)) setRelativeTo(treeNodes[0]?.id || 0);
  }, [relativeTo, selectedId, treeNodes]);

  useEffect(() => {
    if (!selectedMem) return;
    const parts = selectedMem.n.split(' ');
    const meta = getRelationMeta(selectedMem.id);
    setEditFn(parts[0] || '');
    setEditLn(parts.slice(1).join(' '));
    setEditBy(String(selectedMem.b || ''));
    setEditRel(meta.relation);
    setEditRelativeTo(meta.referenceId);
  }, [selectedMem?.id, links, treeNodes]);

  const addMember = () => {
    if (!fn.trim()) return;
    if (isDemoTree) {
      const newNode: TreeNode = {
        id: 1,
        n: `${fn.trim()} ${ln.trim() || ''}`.trim(),
        b: parseInt(by) || new Date().getFullYear(),
        x: 295,
        y: GEN_Y[1],
        gen: 1,
      };
      const nextNodes = [newNode];
      const nextLinks: [number, number][] = [];
      setTreeNodes(nextNodes);
      setLinks(nextLinks);
      void persistTree(nextNodes, nextLinks);
      setFn('');
      setLn('');
      setBy('');
      setShowAdd(false);
      setSelectedId(newNode.id);
      setRelativeTo(newNode.id);
      return;
    }

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
      x: 110 + sameGeneration.length * 165,
      y: GEN_Y[gen],
      gen,
    };

    const nextNodes = [...treeNodes, newNode];
    let nextLinks = links;
    if (reference) {
      nextLinks = [...links, rel === 'parent' || rel === 'grandparent' ? [id, reference.id] : [reference.id, id]];
      setLinks(nextLinks);
    }
    setTreeNodes(nextNodes);
    void persistTree(nextNodes, nextLinks);
    setFn('');
    setLn('');
    setBy('');
    setShowAdd(false);
    setSelectedId(id);
    setRelativeTo(id);
  };

  const saveMember = () => {
    if (!selectedMem || !editFn.trim()) return;
    const { node, reference } = buildNodeDraft(selectedMem.id, editRel, editRelativeTo, editFn, editLn, editBy);
    const nextNodes = treeNodes.map(item => item.id === selectedMem.id ? node : item);
    const nextLinksBase = links.filter(([from, to]) => from !== selectedMem.id && to !== selectedMem.id);
    const nextLinks = reference
      ? [...nextLinksBase, editRel === 'parent' || editRel === 'grandparent' ? [selectedMem.id, reference.id] as [number, number] : [reference.id, selectedMem.id] as [number, number]]
      : nextLinksBase;
    setTreeNodes(nextNodes);
    setLinks(nextLinks);
    void persistTree(nextNodes, nextLinks);
    showNotif(lang === 'fr' ? 'Membre mis à jour' : 'Member updated', '#00FFD1');
  };

  const deleteMember = () => {
    if (!selectedMem) return;
    const confirmed = window.confirm(lang === 'fr'
      ? `Supprimer ${selectedMem.n} de l'arbre ?`
      : `Remove ${selectedMem.n} from the tree?`);
    if (!confirmed) return;
    const nextNodes = treeNodes.filter(node => node.id !== selectedMem.id);
    const nextLinks = links.filter(([from, to]) => from !== selectedMem.id && to !== selectedMem.id);
    setTreeNodes(nextNodes);
    setLinks(nextLinks);
    setSelectedId(null);
    setRelativeTo(nextNodes[0]?.id || 0);
    void persistTree(nextNodes, nextLinks);
    showNotif(lang === 'fr' ? 'Membre supprimé' : 'Member removed', '#FFB347');
  };

  const resetView = () => {
    setZoom(1);
    setGeneration('all');
    setQuery('');
    if (canvasScrollerRef.current) {
      canvasScrollerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button, input, select, textarea, a')) return;
    const scroller = canvasScrollerRef.current;
    if (!scroller) return;
    panRef.current = {
      active: true,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    scroller.setPointerCapture(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  };

  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const scroller = canvasScrollerRef.current;
    if (!pan.active || pan.pointerId !== event.pointerId || !scroller) return;
    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.y);
    event.preventDefault();
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom(value => Math.min(1.75, Math.max(0.42, value + (event.deltaY > 0 ? -0.08 : 0.08))));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;
    const [a, b] = Array.from(event.touches);
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    pinchRef.current = { active: true, startDistance: distance, startZoom: zoom };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!pinchRef.current.active || event.touches.length !== 2) return;
    const [a, b] = Array.from(event.touches);
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const ratio = distance / Math.max(pinchRef.current.startDistance, 1);
    setZoom(Math.min(1.9, Math.max(0.35, pinchRef.current.startZoom * ratio)));
    event.preventDefault();
  };

  const handleTouchEnd = () => {
    pinchRef.current.active = false;
  };

  const stopPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panRef.current.pointerId !== event.pointerId) return;
    panRef.current.active = false;
    panRef.current.pointerId = -1;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
            <button className="btn-sec" onClick={() => setZoom(value => Math.max(0.35, value - 0.12))} style={{ width: 32, height: 32, padding: 0 }} aria-label="Zoom out"><ZoomOut size={14} /></button>
            <button className="btn-sec" onClick={resetView} style={{ width: 32, height: 32, padding: 0 }} aria-label="Reset"><Focus size={14} /></button>
            <button className="btn-sec" onClick={() => void viewportRef.current?.requestFullscreen()} style={{ width: 32, height: 32, padding: 0 }} aria-label="Fullscreen"><Maximize2 size={14} /></button>
          </div>

          <div
            ref={canvasScrollerRef}
            data-testid="tree-pan-canvas"
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
            onWheel={handleWheelZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              overflow: 'auto',
              minHeight: 390,
              cursor: isPanning ? 'grabbing' : 'grab',
              userSelect: isPanning ? 'none' : undefined,
              touchAction: 'none',
            }}
          >
            <div style={{ width: layout.canvasWidth, height: layout.canvasHeight, transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform .2s ease', position: 'relative' }}>
              <svg viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`} width={layout.canvasWidth} height={layout.canvasHeight} style={{ display: 'block' }}>
                {links.map(([from, to], index) => {
                  const a = treeNodes.find(node => node.id === from);
                  const b = treeNodes.find(node => node.id === to);
                  if (!a || !b || !visibleIds.has(a.id) || !visibleIds.has(b.id)) return null;
                  const fromPos = layout.positions.get(a.id);
                  const toPos = layout.positions.get(b.id);
                  if (!fromPos || !toPos) return null;
                  const ax = fromPos.x + 60;
                  const bx = toPos.x + 60;
                  const ay = fromPos.y + 64;
                  const by = toPos.y;
                  return <path key={index} d={`M${ax},${ay} C${ax},${(ay + by) / 2} ${bx},${(ay + by) / 2} ${bx},${by}`} fill="none" stroke="rgba(0,255,209,0.28)" strokeWidth="1.4" />;
                })}
              </svg>

              {visibleNodes.map(node => {
                const color = GEN_COLORS[node.gen];
                const nodeMsgs = getNodeMsgs(node.n);
                const active = selectedId === node.id;
                const pos = layout.positions.get(node.id) || { x: node.x, y: node.y - 32 };
                return (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    style={{
                      position: 'absolute', left: pos.x, top: pos.y, width: 120, minHeight: 64,
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

      {activeFamilyId && (
        <div style={{ marginTop: '0.45rem', fontSize: '0.56rem', color: cloudReady ? 'rgba(0,255,209,0.7)' : 'rgba(255,179,71,0.8)' }}>
          {cloudReady
            ? (lang === 'fr' ? "Arbre synchronisé avec votre famille" : 'Tree synced with your family')
            : (lang === 'fr' ? "Synchronisation de l'arbre en attente" : 'Tree sync pending')}
        </div>
      )}

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
            {isDemoTree ? <option value={relativeTo}>{lang === 'fr' ? 'Premier membre réel' : 'First real member'}</option> : treeNodes.map(node => <option key={node.id} value={node.id}>{node.n}</option>)}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.8rem' }}>
            <input type="text" className="form-input" value={editFn} onChange={event => setEditFn(event.target.value)} placeholder={t('firstName', lang)} />
            <input type="text" className="form-input" value={editLn} onChange={event => setEditLn(event.target.value)} placeholder={t('lastName', lang)} />
            <input type="number" className="form-input" value={editBy} onChange={event => setEditBy(event.target.value)} placeholder={t('birthYear', lang)} min="1850" max={new Date().getFullYear()} />
            <select className="form-select" value={editRel} onChange={event => setEditRel(event.target.value)}>
              {['parent', 'child', 'sibling', 'grandparent', 'partner'].map(relation => <option key={relation} value={relation}>{t(relation, lang)}</option>)}
            </select>
          </div>
          <label style={{ display: 'block', fontSize: '0.57rem', color: 'rgba(239,246,255,.35)', margin: '0 0 0.3rem' }}>{t('relativeTo', lang)}</label>
          <select className="form-select" value={editRelativeTo} onChange={event => setEditRelativeTo(Number(event.target.value))}>
            {treeNodes.filter(node => node.id !== selectedMem.id).map(node => <option key={node.id} value={node.id}>{node.n}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', margin: '0.8rem 0 0.2rem' }}>
            <button type="button" className="btn-primary" onClick={saveMember}>{t('saveMember', lang)}</button>
            <button type="button" className="btn-sec" onClick={deleteMember} style={{ borderColor: 'rgba(255,107,107,0.5)', color: '#FFB4B4' }}>{t('deleteMember', lang)}</button>
          </div>
          {getNodeMsgs(selectedMem.n).length ? getNodeMsgs(selectedMem.n).map(message => (
            <div key={message.id} style={{ padding: '0.7rem 0', borderTop: '1px solid rgba(0,255,209,0.13)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.56rem', color: '#00FFD1', marginBottom: '0.3rem' }}><MessageCircle size={12} /> {message.y}</div>
              <div style={{ fontSize: '0.65rem', lineHeight: 1.65, color: 'rgba(239,246,255,0.72)' }}>{message.text}</div>
              <MessageMedia message={message} lang={lang} />
            </div>
          )) : <div style={{ fontSize: '0.65rem', color: 'rgba(239,246,255,0.3)', paddingTop: '0.4rem' }}>{t('noMessages', lang)}</div>}
        </div>
      )}
    </div>
  );
}
