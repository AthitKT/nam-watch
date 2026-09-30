/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAreaDetails } from '@/hooks/useAreaDetails';
import { useTranslations } from 'next-intl';
import { StationCard } from '@/components/area/StationCard';
import { SaveAreaButton } from '@/components/ui/SaveAreaButton';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { use } from 'react';

export default function AreaPage({ params }: { params: Promise<{ id: string }> }) {
  // Unify the params unwrapping for Next.js 15
  const unwrappedParams = use(params);
  const areaId = decodeURIComponent(unwrappedParams.id);
  const { data, isLoading, isError } = useAreaDetails(areaId);
  const tArea = useTranslations('area');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError || !data?.area) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/" className="inline-flex items-center text-muted hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>{tArea('back')}</span>
        </Link>
        <div className="text-center text-status-critical p-4 border rounded-lg bg-red-50">
          ไม่พบข้อมูลพื้นที่นี้
        </div>
      </div>
    );
  }

  const { area, stations } = data;

  const riverStations = stations.filter((s: any) => s.type === 'river');
  const canalStations = stations.filter((s: any) => s.type === 'canal');
  const watergateStations = stations.filter((s: any) => s.type === 'watergate');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary transition-colors p-1 -ml-1 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">{tArea('back')}</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {area.type === 'khet' ? tArea('khet') : tArea('amphoe')}{area.name_th}
          </h1>
          <p className="text-sm text-muted">{area.province === 'BKK' ? 'กรุงเทพมหานคร' : 'ปทุมธานี'}</p>
        </div>
        <SaveAreaButton areaId={area.id} areaName={area.name_th} />
      </div>

      <div className="flex flex-col gap-8">
        {stations.length === 0 && (
          <div className="bg-surface border border-dashed rounded-lg p-8 text-center text-muted">
            {tArea('empty')}
          </div>
        )}

        {riverStations.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text">{tArea('riverStations')}</h2>
            <div className="flex flex-col gap-4">
              {riverStations.map((station: any) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          </div>
        )}

        {canalStations.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text">{tArea('canalStations')}</h2>
            <div className="flex flex-col gap-4">
              {canalStations.map((station: any) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          </div>
        )}

        {watergateStations.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-text">{tArea('watergateStations')}</h2>
            <div className="flex flex-col gap-4">
              {watergateStations.map((station: any) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
