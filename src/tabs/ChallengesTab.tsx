import { useState } from 'react';
import { Filter, MessageCircleQuestion, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const DECADE_CHIPS = [
  { cls: 'd2020', label: '2020s', bg: 'rgba(0,255,209,0.07)', color: '#00FFD1', border: 'rgba(0,255,209,0.18)' },
  { cls: 'd2030', label: '2030s', bg: 'rgba(192,132,252,0.07)', color: '#C084FC', border: 'rgba(192,132,252,0.18)' },
  { cls: 'd2040', label: '2040s', bg: 'rgba(255,179,71,0.07)', color: '#FFB347', border: 'rgba(255,179,71,0.18)' },
];

export default function ChallengesTab() {
  const { lang, user, challenges, setChallenges } = useStore();
  const [openForm, setOpenForm] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [newChal, setNewChal] = useState('');
  const [filter, setFilter] = useState<'all' | 'answered' | 'open'>('all');
  const [query, setQuery] = useState('');
  const visibleChallenges = challenges.filter(challenge => {
    const matchesFilter = filter === 'all' || (filter === 'answered' ? challenge.ans.length > 0 : challenge.ans.length === 0);
    return matchesFilter && challenge.q.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  });

  const submitAnswer = (ci: number) => {
    const txt = answerText.trim();
    if (!txt) return;
    const updated = [...challenges];
    updated[ci] = { ...updated[ci], ans: [...updated[ci].ans, { a: user?.first || t('anonymous', lang), y: new Date().getFullYear(), text: txt }] };
    setChallenges(updated);
    setAnswerText('');
    setOpenForm(null);
  };

  const createChallenge = () => {
    const q = newChal.trim();
    if (!q) return;
    setChallenges([{ id: Date.now().toString(), q, ans: [] }, ...challenges]);
    setNewChal('');
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('chalTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('chalSub', lang)}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.45rem', marginBottom: '0.75rem' }}>
        {[
          [challenges.length, t('questionsLabel', lang), '#00FFD1'],
          [challenges.reduce((sum, item) => sum + item.ans.length, 0), t('answersLabel', lang), '#C084FC'],
          [challenges.filter(item => item.ans.length === 0).length, t('awaitingLabel', lang), '#FFB347'],
        ].map(([value, label, color]) => (
          <div key={String(label)} className="glass-card" style={{ padding: '0.7rem', textAlign: 'center' }}>
            <strong style={{ display: 'block', color: String(color), fontSize: '0.9rem' }}>{value}</strong>
            <span style={{ color: 'rgba(239,246,255,.32)', fontSize: '0.48rem' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 170px' }}>
          <Search size={14} style={{ position: 'absolute', top: 11, left: 10, color: 'rgba(239,246,255,.3)' }} />
          <input className="form-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchQuestion', lang)} style={{ paddingLeft: 32 }} />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <Filter size={13} color="rgba(239,246,255,.35)" />
          {(['all', 'answered', 'open'] as const).map(value => (
            <button key={value} className="btn-sec" onClick={() => setFilter(value)} style={{ color: filter === value ? '#00FFD1' : undefined, borderColor: filter === value ? '#00FFD1' : undefined }}>
              {t(`filter${value[0].toUpperCase()}${value.slice(1)}`, lang)}
            </button>
          ))}
        </div>
      </div>

      {visibleChallenges.map((ch) => {
        const ci = challenges.findIndex(item => item.id === ch.id);
        const chip = DECADE_CHIPS[ci % 3];
        return (
          <div key={ch.id} className="glass-card" style={{ marginBottom: '0.9rem' }}>
            <span style={{
              display: 'inline-block', fontSize: '0.6rem', letterSpacing: '0.14em', padding: '0.16rem 0.55rem', borderRadius: 3, marginBottom: '0.5rem',
              background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`,
            }}>
              {chip.label}
            </span>
            <div style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.42)', marginBottom: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{ch.q}"
            </div>

            {ch.ans.map((a, ai) => (
              <div key={ai} style={{ padding: '0.7rem 0', borderTop: '1px solid rgba(0,255,209,0.13)' }}>
                <div style={{ fontSize: '0.58rem', color: 'rgba(239,246,255,0.3)', marginBottom: '0.3rem' }}>{a.a} · {a.y}</div>
                <div style={{ fontSize: '0.65rem', lineHeight: 1.65, color: 'rgba(239,246,255,0.88)' }}>{a.text}</div>
              </div>
            ))}

            <button className="btn-sec" style={{ marginTop: '0.7rem', fontSize: '0.62rem' }} onClick={() => setOpenForm(openForm === ci ? null : ci)}>
              {t('answerLabel', lang)}
            </button>

            {openForm === ci && (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea className="form-textarea" style={{ minHeight: 65 }} value={answerText} onChange={e => setAnswerText(e.target.value)} />
                <button className="btn-primary" style={{ marginTop: '0.4rem', fontSize: '0.68rem', padding: '0.55rem' }} onClick={() => submitAnswer(ci)}>
                  {t('sealLabel', lang)}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!visibleChallenges.length && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '1.8rem' }}>
          <MessageCircleQuestion size={26} color="rgba(0,255,209,.45)" style={{ margin: '0 auto .6rem' }} />
          <div style={{ color: 'rgba(239,246,255,.4)', fontSize: '0.65rem' }}>{t('noChallengeMatch', lang)}</div>
        </div>
      )}

      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#00FFD1', marginBottom: '0.8rem' }}>{t('createChal', lang)}</div>
        <textarea className="form-textarea" style={{ minHeight: 70 }} value={newChal} onChange={e => setNewChal(e.target.value)} />
        <button className="btn-primary" onClick={createChallenge}>{t('sealChal', lang)}</button>
      </div>
    </div>
  );
}
