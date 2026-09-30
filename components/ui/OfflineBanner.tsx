/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const t = useTranslations('pwa');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-status-critical text-white text-sm py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-[100] shadow-md">
      <WifiOff className="w-4 h-4" />
      <span className="font-medium">{t('offlineMessage')}</span>
    </div>
  );
}
