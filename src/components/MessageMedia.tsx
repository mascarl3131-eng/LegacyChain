import { useState } from 'react';
import { Image, Mic2, Video, X } from 'lucide-react';
import type { Message } from '@/lib/data';
import type { LangCode } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import AudioPlayer from '@/components/AudioPlayer';

export default function MessageMedia({
  message,
  lang,
  compact = false,
}: {
  message: Message;
  lang: LangCode;
  compact?: boolean;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  if (!message.photo && !message.audioUrl && !message.videoUrl) return null;

  return (
    <>
      <div style={{ marginTop: compact ? '.55rem' : '.75rem', display: 'grid', gap: '.55rem' }}>
        {message.photo && (
          <button
            type="button"
            onClick={() => setPhotoOpen(true)}
            aria-label={t('openPhoto', lang)}
            style={{
              border: '1px solid rgba(0,255,209,.2)', borderRadius: 10, padding: 0,
              background: 'rgba(0,255,209,.035)', overflow: 'hidden', cursor: 'zoom-in',
              width: compact ? 84 : '100%', maxWidth: compact ? 84 : 280, textAlign: 'left',
            }}
          >
            <img src={message.photo} alt={t('familyPhoto', lang)} style={{ width: '100%', height: compact ? 72 : 160, objectFit: 'cover', display: 'block' }} />
            {!compact && <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', padding: '.4rem .55rem', color: 'rgba(239,246,255,.46)', fontSize: '.52rem' }}><Image size={11} /> {t('tapToEnlarge', lang)}</span>}
          </button>
        )}
        {message.audioUrl && (
          <div style={{ padding: compact ? '.55rem' : '.7rem', borderRadius: 10, border: '1px solid rgba(192,132,252,.22)', background: 'rgba(192,132,252,.045)', maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: '#C084FC', fontSize: '.55rem', marginBottom: '.4rem' }}><Mic2 size={13} /> {t('familyVoiceRecording', lang)}</div>
            <AudioPlayer src={message.audioUrl} />
            {!compact && <p style={{ margin: '.45rem 0 0', color: 'rgba(239,246,255,.38)', fontSize: '.51rem', lineHeight: 1.55 }}>{t('voiceLegacyPhrase', lang)}</p>}
          </div>
        )}
        {message.videoUrl && (
          <div style={{ display: 'grid', gap: '.4rem', maxWidth: compact ? 96 : 320 }}>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label={t('openVideo', lang)}
              style={{
                border: '1px solid rgba(255,179,71,.24)',
                borderRadius: 10,
                padding: 0,
                background: 'rgba(255,179,71,.04)',
                overflow: 'hidden',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <video
                src={message.videoUrl}
                muted
                playsInline
                preload="metadata"
                style={{ width: '100%', height: compact ? 72 : 180, objectFit: 'cover', display: 'block' }}
              />
              {!compact && <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', padding: '.4rem .55rem', color: 'rgba(239,246,255,.46)', fontSize: '.52rem' }}><Video size={11} /> {t('tapVideo', lang)}</span>}
            </button>
            {!compact && <p style={{ margin: 0, color: 'rgba(239,246,255,.38)', fontSize: '.51rem', lineHeight: 1.55 }}>{t('videoLegacyPhrase', lang)}</p>}
          </div>
        )}
      </div>

      {photoOpen && message.photo && (
        <div role="dialog" aria-modal="true" aria-label={t('familyPhoto', lang)} style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(8px)' }}>
          <button type="button" onClick={() => setPhotoOpen(false)} aria-label={t('close', lang)} style={{ position: 'absolute', inset: 0, width: '100%', border: 0, background: 'transparent', cursor: 'zoom-out' }} />
          <img src={message.photo} alt={t('familyPhoto', lang)} style={{ position: 'relative', zIndex: 1, maxWidth: 'min(94vw,1000px)', maxHeight: '86vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,.7)' }} />
          <button type="button" onClick={() => setPhotoOpen(false)} aria-label={t('close', lang)} style={{ position: 'absolute', zIndex: 2, top: 18, right: 18, width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(4,3,10,.75)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><X size={18} /></button>
        </div>
      )}

      {videoOpen && message.videoUrl && (
        <div role="dialog" aria-modal="true" aria-label={t('familyVideo', lang)} style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(8px)' }}>
          <button type="button" onClick={() => setVideoOpen(false)} aria-label={t('close', lang)} style={{ position: 'absolute', inset: 0, width: '100%', border: 0, background: 'transparent', cursor: 'zoom-out' }} />
          <video
            src={message.videoUrl}
            controls
            playsInline
            autoPlay
            style={{ position: 'relative', zIndex: 1, maxWidth: 'min(94vw,1000px)', maxHeight: '86vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,.7)', background: '#000' }}
          />
          <button type="button" onClick={() => setVideoOpen(false)} aria-label={t('close', lang)} style={{ position: 'absolute', zIndex: 2, top: 18, right: 18, width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(4,3,10,.75)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><X size={18} /></button>
        </div>
      )}
    </>
  );
}
