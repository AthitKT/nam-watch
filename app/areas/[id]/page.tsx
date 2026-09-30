'use client';

import { useAreaDetails } from '@/hooks/useAreaDetails';
import { useTranslations } from 'next-intl';
import { StationCard } from '@/components/area/StationCard';
import { SaveAreaButton } from '@/components/ui/SaveAreaButton';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <div className="text-center text-status-critical p-4 border rounded-lg bg-red-50">
        ไม่พบข้อมูลพื้นที่นี้
      </div>
    );
  }

  const { area, stations } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm">กลับหน้าหลัก</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">{area.name_th}</h1>
          <p className="text-sm text-muted">{area.province === 'BKK' ? 'กรุงเทพมหานคร' : 'ปทุมธานี'}</p>
        </div>
        <SaveAreaButton areaId={area.id} areaName={area.name_th} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-text">สถานีตรวจวัดทั้งหมด ({stations.length})</h2>
        
        {stations.length === 0 ? (
          <div className="bg-surface border border-dashed rounded-lg p-8 text-center text-muted">
            {tArea('empty')}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {stations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
