import { useStore } from '@/lib/store';

export default function Notification() {
  const { notif } = useStore();

  if (!notif) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 600,
        background: 'rgba(4,3,10,0.95)',
        fontFamily: "'DM Mono',monospace",
        fontSize: '0.7rem',
        padding: '0.6rem 1.1rem',
        borderRadius: 8,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
        border: `1px solid ${notif.color}`,
        color: notif.color,
        opacity: 1,
      }}
    >
      {notif.msg}
    </div>
  );
}
