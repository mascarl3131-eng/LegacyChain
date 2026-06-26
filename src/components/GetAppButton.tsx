import { Download, Share } from 'lucide-react';
import { useInstallApp } from '@/lib/installApp';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

type GetAppButtonProps = {
  variant?: 'landing' | 'menu';
};

export default function GetAppButton({ variant = 'landing' }: GetAppButtonProps) {
  const { lang } = useStore();
  const { isIos, isStandalone, showHelp, install } = useInstallApp();

  if (isStandalone) return null;

  const isMenu = variant === 'menu';

  return (
    <div style={{ width: '100%' }}>
      <button
        type="button"
        onClick={() => void install()}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.55rem',
          padding: isMenu ? '0.62rem 0.75rem' : '0.78rem 1rem',
          borderRadius: isMenu ? 8 : 10,
          border: '1px solid rgba(0,255,209,0.42)',
          background: isMenu ? 'rgba(0,255,209,0.055)' : 'linear-gradient(135deg,rgba(0,255,209,0.12),rgba(192,132,252,0.08))',
          color: '#00FFD1',
          fontFamily: "'DM Mono',monospace",
          fontSize: isMenu ? '0.64rem' : '0.72rem',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          boxShadow: isMenu ? 'none' : '0 0 18px rgba(0,255,209,0.08)',
        }}
      >
        {isIos ? <Share size={15} /> : <Download size={15} />}
        {t('getTheApp', lang)}
      </button>
      {showHelp && (
        <div style={{ marginTop: '0.45rem', color: 'rgba(239,246,255,0.52)', fontSize: isMenu ? '0.55rem' : '0.58rem', lineHeight: 1.55, textAlign: 'center' }}>
          {isIos ? t('installIosHelp', lang) : t('installDesktopHelp', lang)}
        </div>
      )}
    </div>
  );
}
