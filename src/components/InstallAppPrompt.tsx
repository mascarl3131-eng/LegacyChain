import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { useInstallApp } from '@/lib/installApp';

export default function InstallAppPrompt() {
  const { page, lang } = useStore();
  const { canInstall, isIos, isStandalone, showHelp, install } = useInstallApp();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('legacychain-install-dismissed') === '1');

  if (page !== 'app' || dismissed || isStandalone) return null;
  if (!canInstall && !isIos) return null;

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
        <span>{showHelp ? t('installIosHelp', lang) : t('installAppDesc', lang)}</span>
      </div>
      <button
        type="button"
        className="install-action"
        onClick={async () => {
          const outcome = await install();
          if (outcome === 'accepted') close();
        }}
      >
        {isIos ? <Share size={15} /> : <Download size={15} />}
        {t('installAppBtn', lang)}
      </button>
    </div>
  );
}
