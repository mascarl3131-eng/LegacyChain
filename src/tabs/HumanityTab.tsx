import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { FLAGS, BANNED_WORDS } from '@/lib/data';

const H_EMOJIS = ['hope', 'love', 'wisdom', 'peace', 'warning', 'memory'];
const EMO_GLOW: Record<string, string> = {
  hope: '#00FFD1', love: '#FF6B9D', wisdom: '#C084FC', memory: '#FFB347', warning: '#FF2D55', peace: '#7DD3FC',
};

export default function HumanityTab() {
  const { lang, hMsgs, addHMsg, hEmo, setHEmo, setShowSubmitAnim, showNotif } = useStore();
  const [hName, setHName] = useState('');
  const [hCountry, setHCountry] = useState('Australia');
  const [hTo, setHTo] = useState('To future generations');
  const [hMsg, setHMsg] = useState('');
  const [hMod, setHMod] = useState('');

  const isBanned = (txt: string) => BANNED_WORDS.some(w => txt.toLowerCase().includes(w));

  const submitHumanity = async () => {
    const txt = hMsg.trim();
    if (!txt) return;

    if (isBanned(txt)) {
      setHMod(t('modBanned', lang));
      return;
    }

    // Simulate AI moderation
    const approved = Math.random() > 0.1;
    if (!approved) {
      setHMod(t('modBanned', lang));
      return;
    }

    const country = hCountry.trim() || 'the world';
    const name = hName.trim() || `A voice from ${country}`;
    const flag = FLAGS[country] || '🌍';

    const newMsg = {
      id: Date.now().toString(),
      a: name,
      c: country,
      f: flag,
      text: txt,
      e: hEmo as 'hope' | 'love' | 'wisdom' | 'memory' | 'warning' | 'peace',
      y: new Date().getFullYear(),
      likes: 0,
    };

    setShowSubmitAnim(true);
    setTimeout(() => {
      addHMsg(newMsg);
      setHMsg('');
      setHMod('');
      showNotif('Voice sealed ✦', '#00FFD1');
    }, 1500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '2rem 0.5rem 1.5rem', borderBottom: '1px solid rgba(0,255,209,0.13)', marginBottom: '1.5rem' }}>
        <div className="font-display" style={{ fontSize: 'clamp(1.3rem,6vw,2.4rem)', color: '#EFF6FF', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>
          {t('hvTitle', lang)}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(239,246,255,0.36)', letterSpacing: '0.08em', maxWidth: 340, margin: '0 auto 0.8rem', lineHeight: 1.7 }}>
          {t('hvSub', lang)}
        </p>
        <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em' }}>
          <strong style={{ color: '#00FFD1' }}>{(hMsgs.length + 94314).toLocaleString()}</strong> {t('voices', lang)} · <strong style={{ color: '#00FFD1' }}>47</strong> {t('countries', lang)}
        </div>
      </div>

      {/* Masonry */}
      <div style={{ columns: 1, gap: '0.75rem' }}>
        {hMsgs.map((m) => (
          <div
            key={m.id}
            className="glass-card"
            style={{ marginBottom: '0.75rem', breakInside: 'avoid', position: 'relative', overflow: 'hidden', paddingTop: '1rem' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.6, background: EMO_GLOW[m.e] || '#00FFD1' }} />
            <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', fontSize: '0.9rem' }}>{m.f}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(0,255,209,0.62)', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>{m.a} · {m.y}</div>
            <div style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'rgba(239,246,255,0.78)' }}>{m.text}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(239,246,255,0.25)', border: '1px solid rgba(0,255,209,0.13)', padding: '0.1rem 0.4rem', borderRadius: 2, textTransform: 'uppercase' }}>{m.e}</span>
              <button style={{ background: 'transparent', border: 'none', color: 'rgba(239,246,255,0.25)', fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', cursor: 'pointer' }}>
                ♥ {m.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Form */}
      <div className="glass-card" style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: '#00FFD1', marginBottom: '1rem' }}>{t('leaveVoice', lang)}</div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('yourName', lang)} <span style={{ opacity: 0.4 }}>(optional)</span></label>
          <input type="text" className="form-input" value={hName} onChange={e => setHName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('country', lang)}</label>
          <input type="text" className="form-input" value={hCountry} onChange={e => setHCountry(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('toWhom', lang)}</label>
          <select className="form-select" value={hTo} onChange={e => setHTo(e.target.value)}>
            <option>{t('toFuture', lang)}</option>
            <option>{t('toDescendants', lang)}</option>
            <option>{t('toHumanity', lang)}</option>
            <option>{t('toWhoever', lang)}</option>
          </select>
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('yourMsg', lang)}</label>
          <textarea className="form-textarea" value={hMsg} onChange={e => setHMsg(e.target.value)} maxLength={300} rows={4} />
          <div style={{ textAlign: 'right', fontSize: '0.6rem', color: 'rgba(239,246,255,0.25)', marginTop: '0.2rem' }}>{hMsg.length}/300</div>
        </div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('emotion', lang)}</label>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {H_EMOJIS.map(e => (
              <button key={e} className={`emo-btn sel-${e === hEmo ? e : ''}`} onClick={() => setHEmo(e)}>
                {t(`e${e.charAt(0).toUpperCase() + e.slice(1)}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {hMod && (
          <div style={{ background: 'rgba(255,45,85,0.07)', border: '1px solid rgba(255,45,85,0.28)', color: '#FF2D55', fontSize: '0.7rem', padding: '0.85rem', borderRadius: 8, marginTop: '0.65rem', lineHeight: 1.65, textAlign: 'center' }}>
            {hMod}
          </div>
        )}

        <button className="btn-primary" onClick={submitHumanity}>{t('sealVoice', lang)}</button>
        <div style={{ fontSize: '0.57rem', color: 'rgba(239,246,255,0.15)', textAlign: 'center', marginTop: '0.5rem' }}>{t('aiReview', lang)}</div>
      </div>
    </div>
  );
}
