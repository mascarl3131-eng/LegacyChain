import { useEffect, useState } from 'react';

export interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallEvent: InstallEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredInstallEvent = event as InstallEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallEvent = null;
    notifyListeners();
  });
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandaloneApp() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function useInstallApp() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(deferredInstallEvent);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const listener = () => setInstallEvent(deferredInstallEvent);
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') {
        deferredInstallEvent = null;
        setInstallEvent(null);
        notifyListeners();
      }
      return choice.outcome;
    }
    setShowHelp(true);
    return 'dismissed' as const;
  };

  return {
    canInstall: Boolean(installEvent),
    isIos: isIosDevice(),
    isStandalone: isStandaloneApp(),
    showHelp,
    setShowHelp,
    install,
  };
}
