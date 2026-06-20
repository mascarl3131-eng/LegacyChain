import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppPrompt() {
  const { page, lang } = useStore();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('legacychain-install-dismissed') === '1');

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (page !== 'app' || dismissed || window.matchMedia('(display-mode: standalone)').matches) return null;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!installEvent && !isIos) return null;

  const close = () => {
    setDismissed(true);
    localStorage.setItem('legacychain-install-dismissed', '1');
  };

  return (
    <div className="install-app-prompt">
      <button type="button" onClick={close} className="install-close" aria-label="Close"><X size={14} /></button>
      <img src="/legacychain-icon.svg" alt="" />
      <div>
        <strong>{t('installAppTitle', lang)}</strong>
        <span>{showIosHelp ? t('installIosHelp', lang) : t('installAppDesc', lang)}</span>
      </div>
      <button
        type="button"
        className="install-action"
        onClick={async () => {
          if (installEvent) {
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            if (choice.outcome === 'accepted') close();
          } else {
            setShowIosHelp(true);
          }
        }}
      >
        {isIos ? <Share size={15} /> : <Download size={15} />}
        {t('installAppBtn', lang)}
      </button>
    </div>
  );
}
