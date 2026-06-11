import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function SubmitAnimation() {
  const { showSubmitAnim, setShowSubmitAnim } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!showSubmitAnim) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pts: { x: number; y: number; vx: number; vy: number; a: number; r: number; col: string }[] = [];
    for (let i = 0; i < 140; i++) {
      pts.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - Math.random() * 3,
        a: 1,
        r: Math.random() * 2.5 + 1,
        col: Math.random() < 0.65 ? '0,255,209' : '192,132,252',
      });
    }

    let f = 0;
    let animId: number;

    function anim() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.a -= 0.015;
        p.vy += 0.04;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.col},${Math.max(0, p.a)})`;
        ctx!.fill();
      });
      f++;
      if (f < 90) animId = requestAnimationFrame(anim);
      else setShowSubmitAnim(false);
    }
    animId = requestAnimationFrame(anim);

    return () => cancelAnimationFrame(animId);
  }, [showSubmitAnim, setShowSubmitAnim]);

  if (!showSubmitAnim) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(4,3,10,0.92)',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <div
        className="font-display"
        style={{
          position: 'relative',
          zIndex: 1,
          color: '#00FFD1',
          fontSize: '1rem',
          textAlign: 'center',
          padding: '1rem',
          maxWidth: 280,
          lineHeight: 1.6,
        }}
      >
        Sealing your words...
      </div>
    </div>
  );
}
