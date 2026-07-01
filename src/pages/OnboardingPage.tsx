import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { OB_WORDS, LANGS } from '@/lib/i18n';
import type { LangCode } from '@/lib/i18n';

export default function OnboardingPage() {
  const { page, setPage, lang, setLang } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [langDropOpen, setLangDropOpen] = useState(false);

  useEffect(() => {
    if (page !== 'onboarding') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const word = OB_WORDS[lang] || 'FAMILY';
    const fs = Math.min(64, canvas.width / word.length * 0.8);

    interface Letter {
      ch: string;
      ox: number;
      vx: number;
      vy: number;
      a: number;
      x: number;
      y: number;
    }

    const letters: Letter[] = word.split('').map((ch, i) => ({
      ch,
      ox: canvas.width / 2 + (i - word.length / 2 + 0.5) * (fs * 0.85),
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      a: 0,
      x: canvas.width / 2,
      y: canvas.height / 2,
    }));

    let fr = 0;
    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      fr++;
      ctx!.font = `bold ${fs}px 'Cinzel',serif`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';

      if (fr < 80) {
        letters.forEach(l => {
          l.a = Math.min(1, l.a + 0.025);
          l.vx *= 0.93;
          l.vy *= 0.93;
          l.x += (l.ox - l.x) * 0.1 + l.vx;
          l.y += (canvas!.height / 2 - l.y) * 0.1 + l.vy;
          ctx!.fillStyle = `rgba(0,255,209,${l.a})`;
          ctx!.fillText(l.ch, l.x, l.y);
        });
      } else if (fr < 180) {
        letters.forEach(l => {
          ctx!.fillStyle = 'rgba(0,255,209,0.88)';
          ctx!.fillText(l.ch, l.ox, canvas!.height / 2);
        });
      } else {
        if (fr === 181) {
          ctx!.fillStyle = `rgba(0,255,209,${Math.min(1, (fr - 180) / 35)})`;
          ctx!.font = `bold ${Math.min(60, canvas!.width * 0.14)}px serif`;
          ctx!.fillText('⬡', canvas!.width / 2, canvas!.height / 2);
        } else {
          ctx!.fillStyle = `rgba(0,255,209,${Math.min(1, (fr - 180) / 35)})`;
          ctx!.font = `bold ${Math.min(60, canvas!.width * 0.14)}px serif`;
          ctx!.fillText('⬡', canvas!.width / 2, canvas!.height / 2);
        }
      }

      if (fr < 310) {
        animId = requestAnimationFrame(draw);
      } else {
        setPage('landing');
      }
    }

    animId = requestAnimationFrame(draw);

    const timer = setTimeout(() => setPage('landing'), 6000);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timer);
    };
  }, [page, lang, setPage]);

  if (page !== 'onboarding') return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Language Picker */}
      <div style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', zIndex: 10 }}>
        <button
          onClick={() => setLangDropOpen(!langDropOpen)}
          style={{
            background: 'rgba(4,3,10,0.7)',
            border: '1px solid rgba(0,255,209,0.13)',
            color: '#00FFD1',
            fontFamily: "'DM Mono',monospace",
            fontSize: '0.68rem',
            padding: '0.35rem 0.7rem',
            borderRadius: 4,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          🌐 {lang.toUpperCase()} ▾
        </button>
        {langDropOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            left: 0,
            background: '#0d0b1a',
            border: '1px solid rgba(0,255,209,0.13)',
            borderRadius: 8,
            minWidth: 160,
            zIndex: 100,
            maxHeight: 260,
            overflowY: 'auto',
          }}>
            {Object.values(LANGS).map(l => (
              <div
                key={l.code}
                onClick={() => { setLang(l.code as LangCode); setLangDropOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.9rem',
                  fontSize: '0.72rem',
                  color: l.code === lang ? '#00FFD1' : 'rgba(239,246,255,0.7)',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  background: l.code === lang ? 'rgba(0,255,209,0.05)' : 'transparent',
                }}
              >
                {l.flag} {l.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skip Button */}
      <button
        onClick={() => setPage('landing')}
        style={{
          position: 'absolute',
          top: '1.2rem',
          right: '1.2rem',
          zIndex: 10,
          background: 'transparent',
          border: '1px solid rgba(0,255,209,0.13)',
          color: '#00FFD1',
          fontFamily: "'DM Mono',monospace",
          fontSize: '0.72rem',
          padding: '0.4rem 0.85rem',
          borderRadius: 4,
          cursor: 'pointer',
          letterSpacing: '0.1em',
        }}
      >
        SKIP →
      </button>

      {/* Center Text */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '1rem', transform: 'translateY(4.5rem)' }}>
        <p style={{ color: 'rgba(239,246,255,0.5)', marginTop: '1.4rem', fontSize: '0.8rem', lineHeight: 1.8, letterSpacing: '0.12em' }}>
          Every family deserves to travel through time
        </p>
      </div>
    </div>
  );
}
