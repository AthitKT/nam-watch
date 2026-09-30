'use client';

import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('@/components/map/MapClient'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-surface rounded-lg animate-pulse" />
});

export default function MapPage() {
  const t = useTranslations('map');

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary transition-colors p-1 -ml-1 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">ย้อนกลับ</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-primary-dark">{t('title')}</h1>
      <MapClient />
    </div>
  );
}
