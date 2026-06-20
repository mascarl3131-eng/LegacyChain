import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function ImmersiveReader() {
  const { immersiveMsg, setImmersiveMsg, lang } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!immersiveMsg) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      setSoundOn(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 45; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.2 + 0.04,
      });
    }

    let animId: number;
    function draw() {
      if (!immersiveMsg) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      pts.forEach(p => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0,255,209,${p.a})`;
        ctx!.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, [immersiveMsg]);

  useEffect(() => {
    if (!soundOn || !immersiveMsg) return;

    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      ctx.resume();

      const notes = [261.6, 293.7, 329.6, 349.2, 392];
      let ni = 0;

      intervalRef.current = setInterval(() => {
        if (!soundOn) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = notes[ni % notes.length];
        g.gain.setValueAtTime(0.02, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        o.start();
        o.stop(ctx.currentTime + 2);
        ni++;
      }, 2200);
    } catch (e) {
      console.error('Audio error:', e);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [soundOn, immersiveMsg]);

  const toggleSound = () => {
    setSoundOn(prev => !prev);
  };

  if (!immersiveMsg) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 450,
        background: 'rgba(4,3,10,0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '90vw', padding: '1.5rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#00FFD1', letterSpacing: '0.2em', marginBottom: '1.2rem' }}>
          {immersiveMsg.a.toUpperCase()} · {immersiveMsg.y}
        </div>
        <div className="font-display" style={{ fontSize: 'clamp(1rem,4vw,1.6rem)', color: '#EFF6FF', lineHeight: 1.95 }}>
          {immersiveMsg.text}
        </div>
      </div>
      <button
        onClick={() => setImmersiveMsg(null)}
        style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', zIndex: 3, background: 'transparent', border: '1px solid rgba(0,255,209,0.13)', color: 'rgba(239,246,255,0.35)', fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', padding: '0.35rem 0.7rem', borderRadius: 4, cursor: 'pointer' }}
      >
        × {t('close', lang)}
      </button>
      <button
        onClick={toggleSound}
        style={{ position: 'absolute', bottom: 'calc(1.2rem + 32px)', right: '1.2rem', zIndex: 3, background: 'transparent', border: '1px solid rgba(0,255,209,0.13)', color: 'rgba(239,246,255,0.35)', fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', padding: '0.35rem 0.7rem', borderRadius: 4, cursor: 'pointer' }}
      >
        {soundOn ? `♫ ${t('soundOn', lang)}` : `♫ ${t('sound', lang)}`}
      </button>
    </div>
  );
}
