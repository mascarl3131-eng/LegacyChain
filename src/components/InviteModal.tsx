import { useEffect, useState } from 'react';
import { Check, Copy, Plus, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

type FamilyMembership = {
  role: string;
  family: { id: string; name: string; owner_id: string; created_at: string };
};

export default function InviteModal() {
  const { inviteOpen, setInviteOpen, familyName, lang, session, activeFamilyId, setActiveFamilyId } = useStore();
  const [families, setFamilies] = useState<FamilyMembership[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [newFamilyName, setNewFamilyName] = useState(familyName);
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState('member');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!inviteOpen || !session) return;
    let active = true;
    setLoading(true);
    fetch('/api/families', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || t('familyActionError', lang));
        if (!active) return;
        setFamilies(data.families || []);
        const preferred = activeFamilyId || data.families?.[0]?.family?.id || '';
        setSelectedFamilyId(preferred);
      })
      .catch(reason => setError(reason.message))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, [activeFamilyId, inviteOpen, lang, session]);

  if (!inviteOpen) return null;

  const request = async (body: Record<string, unknown>) => {
    if (!session) throw new Error(t('familyLoginRequired', lang));
    const response = await fetch('/api/families', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || t('familyActionError', lang));
    return data;
  };

  const createFamily = async () => {
    setLoading(true); setError(''); setLink('');
    try {
      const data = await request({ action: 'create', name: newFamilyName.trim() });
      setFamilies(items => [...items, { role: data.role, family: data.family }]);
      setSelectedFamilyId(data.family.id);
      setActiveFamilyId(data.family.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('familyActionError', lang));
    } finally { setLoading(false); }
  };

  const createInvite = async () => {
    setLoading(true); setError(''); setLink('');
    try {
      const data = await request({ action: 'invite', familyId: selectedFamilyId, email: inviteEmail.trim(), role });
      setLink(data.inviteUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('familyActionError', lang));
    } finally { setLoading(false); }
  };

  return (
    <div
      onClick={() => setInviteOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        background: 'rgba(4,3,10,0.88)',
        display: 'grid',
        placeItems: 'center',
        padding: 'calc(1rem + env(safe-area-inset-top)) 1rem calc(1rem + env(safe-area-inset-bottom))',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-family-title"
        onClick={event => event.stopPropagation()}
        style={{
          background: '#0c0a1c',
          border: '1px solid rgba(0,255,209,0.18)',
          borderRadius: 18,
          padding: '1.5rem 1.2rem',
          width: 'min(100%, 480px)',
          position: 'relative',
          maxHeight: 'calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          overflowY: 'auto',
          boxShadow: '0 22px 70px rgba(0,0,0,.55)',
        }}
      >
        <div style={{ width: 36, height: 3, background: 'rgba(239,246,255,0.15)', borderRadius: 2, margin: '0 auto 1rem' }} />
        <button onClick={() => setInviteOpen(false)} style={{ position: 'absolute', top: '0.9rem', right: '1rem', background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.32)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        <h3 id="invite-family-title" className="font-display" style={{ color: '#00FFD1', fontSize: '0.9rem', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>{t('inviteTitle', lang)}</h3>
        <p style={{ fontSize: '0.65rem', color: 'rgba(239,246,255,0.42)', marginBottom: '1rem', lineHeight: 1.7 }}>{t('familyIdExplanation', lang)}</p>

        {!session ? <div style={{ color: '#FFB347', fontSize: '.62rem' }}>{t('familyLoginRequired', lang)}</div> : (
          <>
            {!families.length && !loading && (
              <div style={{ padding: '.75rem', border: '1px solid rgba(255,179,71,.18)', borderRadius: 9, background: 'rgba(255,179,71,.04)', marginBottom: '.75rem' }}>
                <div style={{ color: '#FFB347', fontSize: '.58rem', marginBottom: '.45rem' }}>{t('createFirstFamily', lang)}</div>
                <div style={{ display: 'flex', gap: '.4rem' }}>
                  <input className="form-input" value={newFamilyName} onChange={event => setNewFamilyName(event.target.value)} placeholder={t('familyNameLabel', lang)} />
                  <button className="btn-sec" onClick={() => void createFamily()} disabled={loading || !newFamilyName.trim()} aria-label={t('createFamily', lang)}><Plus size={15} /></button>
                </div>
              </div>
            )}
            {families.length > 0 && (
              <>
                <label style={{ display: 'block', color: 'rgba(239,246,255,.4)', fontSize: '.55rem', marginBottom: '.6rem' }}>{t('selectFamily', lang)}
                  <select className="form-select" value={selectedFamilyId} onChange={event => { setSelectedFamilyId(event.target.value); setActiveFamilyId(event.target.value); setLink(''); }} style={{ marginTop: '.3rem' }}>
                    {families.map(item => <option key={item.family.id} value={item.family.id}>{item.family.name} · {item.role}</option>)}
                  </select>
                </label>
                <label style={{ display: 'block', color: 'rgba(239,246,255,.4)', fontSize: '.55rem', marginBottom: '.6rem' }}>{t('inviteEmailOptional', lang)}
                  <input className="form-input" type="email" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="name@gmail.com" style={{ marginTop: '.3rem' }} />
                </label>
                <label style={{ display: 'block', color: 'rgba(239,246,255,.4)', fontSize: '.55rem', marginBottom: '.7rem' }}>{t('familyRole', lang)}
                  <select className="form-select" value={role} onChange={event => setRole(event.target.value)} style={{ marginTop: '.3rem' }}>
                    <option value="member">{t('familyRoleMember', lang)}</option>
                    <option value="admin">{t('familyRoleAdmin', lang)}</option>
                    <option value="child">{t('familyRoleChild', lang)}</option>
                  </select>
                </label>
                <button className="btn-primary" onClick={() => void createInvite()} disabled={loading || !selectedFamilyId}><ShieldCheck size={14} style={{ display: 'inline', marginRight: 6 }} />{t('generateSecureInvite', lang)}</button>
              </>
            )}
          </>
        )}

        {link && <div style={{ background: 'rgba(0,255,209,0.05)', border: '1px solid rgba(0,255,209,0.13)', borderRadius: 6, padding: '0.55rem 0.75rem', fontSize: '0.7rem', color: '#00FFD1', margin: '0.7rem 0 0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</span>
          <button onClick={() => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {})} className="btn-sec" style={{ flexShrink: 0, padding: '0.25rem 0.52rem' }}>{copied ? <Check size={13} /> : <Copy size={13} />}</button>
        </div>}
        {link && <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${t('inviteTitle', lang)} ${link}`)}`, '_blank')} style={{ width: '100%', background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.18)', color: '#25d366', fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', padding: '0.6rem', borderRadius: 8, cursor: 'pointer', marginBottom: '0.5rem' }}>WhatsApp</button>}
        {error && <div style={{ color: '#FF6B6B', fontSize: '.56rem', marginTop: '.55rem' }}>{error}</div>}
      </div>
    </div>
  );
}
