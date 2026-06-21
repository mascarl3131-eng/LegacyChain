import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [volumeOpen, setVolumeOpen] = useState(false);

  useEffect(() => () => {
    void audioContextRef.current?.close();
  }, []);

  const ensureAmplifier = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      source.connect(gain);
      gain.connect(context.destination);
      audioContextRef.current = context;
      gainNodeRef.current = gain;
    }
    gainNodeRef.current!.gain.value = volume;
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await ensureAmplifier();
      await audio.play();
    }
    else audio.pause();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minHeight: 38, padding: '.3rem .45rem', borderRadius: 8, background: 'rgba(4,3,10,.72)', border: '1px solid rgba(192,132,252,.16)' }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      />
      <button type="button" onClick={() => void togglePlayback()} aria-label={playing ? 'Pause' : 'Play'} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(192,132,252,.4)', background: 'rgba(192,132,252,.1)', color: '#C084FC', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
      </button>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.05}
        value={Math.min(currentTime, duration || 0)}
        onChange={event => {
          const next = Number(event.target.value);
          setCurrentTime(next);
          if (audioRef.current) audioRef.current.currentTime = next;
        }}
        style={{ flex: 1, minWidth: 60, accentColor: '#C084FC', cursor: 'pointer' }}
      />
      <span style={{ color: 'rgba(239,246,255,.48)', fontSize: '.52rem', whiteSpace: 'nowrap' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {volumeOpen && (
          <div style={{ position: 'absolute', left: '50%', bottom: 'calc(100% + 8px)', transform: 'translateX(-50%)', width: 34, height: 116, padding: '10px 7px', borderRadius: 9, background: '#0c0a1c', border: '1px solid rgba(192,132,252,.35)', boxShadow: '0 12px 30px rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', zIndex: 20 }}>
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={volume}
              onChange={event => {
                const next = Number(event.target.value);
                setVolume(next);
                if (gainNodeRef.current) gainNodeRef.current.gain.value = next;
              }}
              style={{ width: 92, accentColor: '#C084FC', cursor: 'pointer', transform: 'rotate(-90deg)' }}
            />
          </div>
        )}
        <button type="button" onClick={() => setVolumeOpen(open => !open)} aria-label="Volume" style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(192,132,252,.2)', background: volumeOpen ? 'rgba(192,132,252,.14)' : 'transparent', color: '#C084FC', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Volume2 size={15} />
        </button>
      </div>
    </div>
  );
}
