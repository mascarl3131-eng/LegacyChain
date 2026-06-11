import { useState } from 'react';
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

  const submitAnswer = (ci: number) => {
    const txt = answerText.trim();
    if (!txt) return;
    const updated = [...challenges];
    updated[ci] = { ...updated[ci], ans: [...updated[ci].ans, { a: user?.first || 'Anonymous', y: new Date().getFullYear(), text: txt }] };
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

      {challenges.map((ch, ci) => {
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

      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#00FFD1', marginBottom: '0.8rem' }}>{t('createChal', lang)}</div>
        <textarea className="form-textarea" style={{ minHeight: 70 }} value={newChal} onChange={e => setNewChal(e.target.value)} />
        <button className="btn-primary" onClick={createChallenge}>{t('sealChal', lang)}</button>
      </div>
    </div>
  );
}
