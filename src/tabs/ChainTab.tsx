import { useEffect, useState, useRef } from 'react';
import { Mic, RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { BANNED_WORDS } from '@/lib/data';
import UnlockYearPicker from '@/components/UnlockYearPicker';
import MessageMedia from '@/components/MessageMedia';

const EMOJIS = ['hope', 'love', 'wisdom', 'memory', 'warning'];
const EMO_COLORS: Record<string, string> = {
  hope: '#00FFD1', love: '#FF6B9D', wisdom: '#C084FC', memory: '#FFB347', warning: '#FF2D55',
};

export default function ChainTab() {
  const { lang, user, session, premium, familyName, activeFamilyId, emo, setEmo, msgs, addMsg, setMsgs, setImmersiveMsg, setUpgradeOpen, setShowSubmitAnim, showNotif } = useStore();
  const [msgType, setMsgType] = useState('standard');
  const [msgText, setMsgText] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyDob, setBabyDob] = useState('');
  const [capName, setCapName] = useState('');
  const [capDate, setCapDate] = useState('');
  const [unlockYr, setUnlockYr] = useState('');
  const [modWarn, setModWarn] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const recIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  const charMax = premium ? 500 : 300;

  useEffect(() => () => {
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stream.getTracks().forEach(track => track.stop());
      recorder.stop();
    }
    void recordingAudioContextRef.current?.close();
  }, [audioPreviewUrl]);

  const isBanned = (txt: string) => BANNED_WORDS.some((w: string) => txt.toLowerCase().includes(w));

  const handleSubmit = async () => {
    const txt = msgText.trim();
    if (!txt || saving) return;

    if (isBanned(txt)) {
      setModWarn(t('modBanned', lang));
      setMsgText('');
      return;
    }

    if (msgs.length >= 10 && !premium) {
      setUpgradeOpen(true);
      return;
    }

    const newMsg = {
      id: Date.now().toString(),
      a: user?.first || t('anonymous', lang),
      y: new Date().getFullYear(),
      text: txt,
      e: emo as 'hope' | 'love' | 'wisdom' | 'memory' | 'warning',
      type: msgType as 'standard' | 'birth' | 'capsule',
      lock: unlockYr ? parseInt(unlockYr) : null,
      baby: msgType === 'birth' ? babyName || null : null,
      dy: msgType === 'birth' && babyDob ? new Date(babyDob).getFullYear() + 18 : null,
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
      photo: photoData,
    };

    if (session && activeFamilyId) {
      setSaving(true);
      const uploadedPaths: string[] = [];
      try {
        const basePath = `${activeFamilyId}/${session.user.id}`;
        let photoPath: string | null = null;
        let audioPath: string | null = null;

        if (photoFile) {
          const extension = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
          photoPath = `${basePath}/${crypto.randomUUID()}.${extension}`;
          const { error } = await supabase.storage.from('family-media').upload(photoPath, photoFile, { contentType: photoFile.type, upsert: false });
          if (error) throw error;
          uploadedPaths.push(photoPath);
        }
        if (audioBlob) {
          const extension = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
          audioPath = `${basePath}/${crypto.randomUUID()}.${extension}`;
          const { error } = await supabase.storage.from('family-media').upload(audioPath, audioBlob, { contentType: audioBlob.type || 'audio/webm', upsert: false });
          if (error) throw error;
          uploadedPaths.push(audioPath);
        }

        const response = await fetch('/api/family-messages', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            familyId: activeFamilyId,
            authorName: newMsg.a,
            message: newMsg.text,
            emotion: newMsg.e,
            messageType: newMsg.type,
            unlockYear: newMsg.lock,
            babyName: newMsg.baby,
            adulthoodYear: newMsg.dy,
            photoPath,
            audioPath,
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || t('familyCloudError', lang));

        const refresh = await fetch(`/api/family-messages?familyId=${encodeURIComponent(activeFamilyId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const refreshed = await refresh.json().catch(() => ({}));
        if (!refresh.ok) throw new Error(refreshed.error || t('familyCloudError', lang));
        setMsgs(refreshed.messages || []);
      } catch (error) {
        if (uploadedPaths.length) await supabase.storage.from('family-media').remove(uploadedPaths);
        console.error('Family message save:', error);
        showNotif(t('familyCloudError', lang), '#FF6B6B');
        setSaving(false);
        return;
      }
    }

    setShowSubmitAnim(true);
    setTimeout(() => {
      if (!session || !activeFamilyId) addMsg(newMsg);
      setMsgText('');
      setBabyName('');
      setBabyDob('');
      setCapName('');
      setCapDate('');
      setUnlockYr('');
      setPhotoData(null);
      setPhotoFile(null);
      setAudioBlob(null);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl('');
      setModWarn('');
      setSaving(false);
      showNotif(t('messageSealed', lang), '#00FFD1');
    }, 700);
  };

  const toggleRecording = async () => {
    if (!premium) { setUpgradeOpen(true); return; }
    if (!isRecording) {
      try {
        setAudioBlob(null);
        const isDesktop = window.matchMedia('(pointer: fine)').matches;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            // Desktop browser processing can need several seconds to settle,
            // which cuts off the start of a recording. The Web Audio gain below
            // already handles volume consistently on computers.
            autoGainControl: !isDesktop,
            echoCancellation: !isDesktop,
            noiseSuppression: !isDesktop,
            channelCount: 1,
          },
        });
        const AudioContextClass = window.AudioContext;
        const audioContext = new AudioContextClass();
        if (audioContext.state === 'suspended') await audioContext.resume();
        const source = audioContext.createMediaStreamSource(stream);
        const gain = audioContext.createGain();
        const destination = audioContext.createMediaStreamDestination();
        gain.gain.value = 1.65;
        source.connect(gain);
        gain.connect(destination);
        recordingAudioContextRef.current = audioContext;
        // Mobile browsers can take several seconds to wake a Web Audio graph.
        // Pull one frame through the graph before starting MediaRecorder so the
        // beginning of the user's voice is not lost.
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const recorder = new MediaRecorder(destination.stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioPreviewUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
          destination.stream.getTracks().forEach(t => t.stop());
          void audioContext.close();
          recordingAudioContextRef.current = null;
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecSeconds(0);
        recIntervalRef.current = setInterval(() => {
          setRecSeconds(s => {
            if (s >= 179) { recorder.stop(); setIsRecording(false); if (recIntervalRef.current) clearInterval(recIntervalRef.current); return 180; }
            return s + 1;
          });
        }, 1000);
      } catch { alert(t('microphoneDenied', lang)); }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    }
  };

  const deleteRecording = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl('');
    setAudioBlob(null);
    setRecSeconds(0);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showNotif(t('mediaTooLarge', lang), '#FF6B6B');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const replyTo = (msg: typeof msgs[0]) => {
    setMsgText(`[↩ ${msg.a}, ${new Date().getFullYear() - msg.y}y later] `);
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
        {t('chainTitle', lang)}
      </div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
        {familyName.toUpperCase()} · {new Date().getFullYear()}
      </div>

      {/* Timeline */}
      <div>
        {msgs.map((m, i) => (
          <div key={m.id} style={{ position: 'relative', marginBottom: '1.4rem', paddingLeft: '2.2rem' }}>
            {i < msgs.length - 1 && (
              <div style={{
                content: '""',
                position: 'absolute',
                left: 9,
                top: 26,
                bottom: '-1.4rem',
                width: 1,
                background: 'linear-gradient(to bottom,rgba(0,255,209,0.25),transparent)',
              }} />
            )}
            <div style={{
              position: 'absolute', left: 4, top: 14, width: 11, height: 11, borderRadius: '50%',
              border: `2px solid ${EMO_COLORS[m.e] || '#00FFD1'}`, background: '#04030A',
              boxShadow: `0 0 7px ${EMO_COLORS[m.e] || '#00FFD1'}66`,
            }} />
            <div className="glass-card">
              {m.type === 'birth' && m.baby && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.28)', color: '#FFB347', fontSize: '0.63rem', padding: '0.22rem 0.6rem', borderRadius: 20, marginBottom: '0.6rem' }}>
                  👶 {m.baby} · {m.dy || '—'} · {t('inYears', lang).replace('{count}', String((m.dy || new Date().getFullYear()) - new Date().getFullYear()))}
                </div>
              )}
              {m.type === 'capsule' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,179,71,0.07)', border: '1px solid rgba(255,179,71,0.26)', color: '#FFB347', fontSize: '0.63rem', padding: '0.22rem 0.6rem', borderRadius: 20, marginBottom: '0.6rem' }}>
                  ⊙ {t('capsule', lang)}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#00FFD1', letterSpacing: '0.08em' }}>{m.a}</span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(239,246,255,0.28)' }}>{m.y}</span>
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.75, color: 'rgba(239,246,255,0.8)' }}>{m.text}</div>
              <MessageMedia message={m} lang={lang} compact />
              {m.lock && <div style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.25)', marginTop: '0.28rem' }}>🔒 {t('sealedUntil', lang)} {m.lock}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.57rem', letterSpacing: '0.1em', padding: '0.15rem 0.5rem', borderRadius: 3, background: 'rgba(0,255,209,0.05)', border: '1px solid rgba(0,255,209,0.13)', color: 'rgba(239,246,255,0.38)', textTransform: 'uppercase' }}>{t(`e${m.e.charAt(0).toUpperCase() + m.e.slice(1)}`, lang)}</span>
                <button className="btn-sec" style={{ fontSize: '0.58rem', padding: '0.22rem 0.5rem' }} onClick={() => setImmersiveMsg(m)}>👁 {t('read', lang)}</button>
                <button className="btn-sec" style={{ fontSize: '0.58rem', padding: '0.22rem 0.5rem' }} onClick={() => replyTo(m)}>↩ {t('reply', lang)}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seal Form */}
      <div className="glass-card" style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: '#00FFD1', marginBottom: '1rem' }}>{t('sealMsg', lang)}</div>

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('msgType', lang)}</label>
          <select className="form-select" value={msgType} onChange={e => setMsgType(e.target.value)}>
            <option value="standard">{t('standard', lang)}</option>
            <option value="birth">{t('birth', lang)}</option>
            <option value="capsule">{t('capsule', lang)}</option>
          </select>
        </div>

        {msgType === 'birth' && (
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('babyName', lang)}</label>
              <input type="text" className="form-input" value={babyName} onChange={e => setBabyName(e.target.value)} placeholder="Lucas..." />
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('babyDob', lang)}</label>
              <input type="date" className="form-input" value={babyDob} onChange={e => setBabyDob(e.target.value)} />
            </div>
          </div>
        )}

        {msgType === 'capsule' && (
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('capName', lang)}</label>
              <input type="text" className="form-input" value={capName} onChange={e => setCapName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('capDate', lang)}</label>
              <input type="date" className="form-input" value={capDate} onChange={e => setCapDate(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('yourMsg', lang)}</label>
          <textarea className="form-textarea" value={msgText} onChange={e => setMsgText(e.target.value)} maxLength={charMax} rows={4} />
          <div style={{ textAlign: 'right', fontSize: '0.6rem', color: 'rgba(239,246,255,0.25)', marginTop: '0.2rem' }}>
            {msgText.length}/{charMax}
          </div>
        </div>

        {/* Photo Upload */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>
            {t('photo', lang)} {!premium && <span style={{ color: '#FFB347', fontSize: '0.56rem' }}>✦ PREMIUM</span>}
          </label>
          <div
            onClick={() => premium ? photoInputRef.current?.click() : setUpgradeOpen(true)}
            style={{ border: '1px dashed rgba(0,255,209,0.22)', borderRadius: 10, padding: '1rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            {photoData ? (
              <img src={photoData} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #00FFD1', margin: '0.5rem auto 0', display: 'block' }} />
            ) : (
              <div style={{ fontSize: '0.62rem', color: 'rgba(239,246,255,0.28)' }}>📸 {t('tapPhoto', lang)}</div>
            )}
          </div>
        </div>

        {/* Audio Recorder */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>
            {t('audio', lang)} {!premium && <span style={{ color: '#FFB347', fontSize: '0.56rem' }}>✦ PREMIUM · 3 MIN</span>}
          </label>
          <p style={{ margin: '0 0 .55rem', color: 'rgba(239,246,255,.38)', fontSize: '.54rem', lineHeight: 1.6 }}>{t('voiceLegacyPhrase', lang)}</p>
          <div style={{ background: 'rgba(0,255,209,0.04)', border: '1px solid rgba(0,255,209,0.2)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button
                onClick={toggleRecording}
                style={{
                  width: 46, height: 46, borderRadius: '50%', border: `2px solid ${isRecording ? '#FF2D55' : '#00FFD1'}`,
                  background: 'transparent', color: isRecording ? '#FF2D55' : '#00FFD1', fontSize: '1.1rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  animation: isRecording ? 'pulse-rec 1s infinite' : 'none',
                }}
              >
                {isRecording ? '⏹' : '🎙'}
              </button>
              <div style={{ height: 36, background: 'rgba(0,255,209,0.05)', borderRadius: 6, overflow: 'hidden', flex: 1 }}>
                <canvas ref={waveCanvasRef} style={{ width: '100%', height: '100%' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: isRecording ? '#FF2D55' : '#00FFD1', letterSpacing: '0.1em', flexShrink: 0 }}>
                {Math.floor(recSeconds / 60)}:{(recSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {audioBlob && audioPreviewUrl ? (
              <div style={{ display: 'grid', gap: '.55rem' }}>
                <audio controls preload="metadata" src={audioPreviewUrl} style={{ width: '100%', height: 36 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem' }}>
                  <button type="button" className="btn-sec" onClick={() => void toggleRecording()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem' }}>
                    <RotateCcw size={13} /> {t('recordAgain', lang)}
                  </button>
                  <button type="button" className="btn-sec" onClick={deleteRecording} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem', color: '#FF6B6B', borderColor: 'rgba(255,107,107,.25)' }}>
                    <Trash2 size={13} /> {t('deleteRecording', lang)}
                  </button>
                </div>
                <div style={{ fontSize: '0.58rem', color: '#00FFD1', textAlign: 'center' }}>{t('audioReadyReview', lang)}</div>
              </div>
            ) : (
              <div style={{ fontSize: '0.6rem', color: 'rgba(239,246,255,0.28)', textAlign: 'center' }}>
                {isRecording ? t('recording', lang) : <><Mic size={12} style={{ display: 'inline', marginRight: 5 }} />{t('tapRecord', lang)}</>}
              </div>
            )}
          </div>
        </div>

        {/* Emotion */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>{t('emotion', lang)}</label>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {EMOJIS.map(e => (
              <button key={e} className={`emo-btn sel-${e === emo ? e : ''}`} onClick={() => setEmo(e)}>
                {t(`e${e.charAt(0).toUpperCase() + e.slice(1)}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Unlock Year */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>
            {t('unlockYr', lang)} <span style={{ opacity: 0.4 }}>({t('optional', lang)})</span>
          </label>
          <UnlockYearPicker lang={lang} value={unlockYr} onChange={setUnlockYr} />
        </div>

        {modWarn && (
          <div style={{ background: 'rgba(255,45,85,0.07)', border: '1px solid rgba(255,45,85,0.28)', color: '#FF2D55', fontSize: '0.7rem', padding: '0.85rem', borderRadius: 8, marginTop: '0.65rem', lineHeight: 1.65, textAlign: 'center' }}>
            {modWarn}
          </div>
        )}

        <button className="btn-primary" onClick={() => void handleSubmit()} disabled={saving}>{saving ? t('savingCloud', lang) : t('sealBtn', lang)}</button>
      </div>

      {!premium && (
        <button className="btn-amber" onClick={() => setUpgradeOpen(true)}>{t('premiumBtn', lang)}</button>
      )}
    </div>
  );
}
