'use client';

import { useStationDetails } from '@/hooks/useStationDetails';
import { useStationHistory } from '@/hooks/useStationHistory';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, Clock } from 'lucide-react';
import { use, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StationChart } from '@/components/station/StationChart';
import { getStationStatus } from '@/hooks/useAreas';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const stationId = decodeURIComponent(unwrappedParams.id);
  
  const [days, setDays] = useState<1 | 7>(1);
  
  const { data: station, isLoading: isStationLoading, isError: isStationError } = useStationDetails(stationId);
  const { data: history, isLoading: isHistoryLoading } = useStationHistory(stationId, days);
  
  const tArea = useTranslations('area');
  const t = useTranslations('station');

  if (isStationLoading || !station) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isStationError) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/" className="inline-flex items-center text-muted hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>{tArea('back')}</span>
        </Link>
        <div className="text-center text-status-critical p-4 border rounded-lg bg-red-50">
          ไม่พบข้อมูลสถานีนี้
        </div>
      </div>
    );
  }

  const latestReading = history && history.length > 0 ? history[history.length - 1] : null;
  const status = getStationStatus(station, latestReading);
  const isPtt = station.type === 'watergate';
  
  const isStale = latestReading && (new Date().getTime() - new Date(latestReading.ts).getTime()) > 60 * 60 * 1000;
  const isNoData = !latestReading || (new Date().getTime() - new Date(latestReading.ts).getTime()) > 24 * 60 * 60 * 1000;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-2 text-muted">
        <Link href={`/areas/${station.area.id}`} className="hover:text-primary transition-colors p-1 -ml-1 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">{t('backToArea')}</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary-dark">{station.name}</h1>
        <p className="text-sm text-muted">{station.agency}</p>
      </div>

      {isNoData ? (
        <div className="bg-surface border border-dashed rounded-lg p-8 text-center text-muted">
          {t('noData')}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-white border rounded-lg p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <StatusBadge status={status} className="scale-110 origin-top-left" />
            </div>

            {isPtt ? (
              <div className="flex gap-4 mt-2">
                <div className="flex-1 bg-surface p-4 rounded-md">
                  <p className="text-sm text-muted mb-1">{t('gateIn')}</p>
                  <p className="font-bold text-3xl text-primary-dark">
                    {latestReading.level !== null ? latestReading.level.toFixed(2) : '-'}
                  </p>
                  <p className="text-sm text-muted mt-1">{station.unit}</p>
                </div>
                <div className="flex-1 bg-surface p-4 rounded-md">
                  <p className="text-sm text-muted mb-1">{t('gateOut')}</p>
                  <p className="font-bold text-3xl text-primary-dark">
                    {latestReading.level_out !== null ? latestReading.level_out.toFixed(2) : '-'}
                  </p>
                  <p className="text-sm text-muted mt-1">{station.unit}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-sm text-muted">{t(station.unit.includes('MSL') ? 'levelMsl' : 'levelM')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-5xl text-primary-dark tracking-tight">
                    {latestReading.level !== null ? (latestReading.level > 0 ? '+' : '') + latestReading.level.toFixed(2) : '-'}
                  </span>
                  <span className="text-lg text-muted font-medium">{station.unit}</span>
                </div>
              </div>
            )}

            {!isPtt && (station.bank_level !== null || station.warning_level !== null || station.critical_level !== null) && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                {station.bank_level !== null && (
                  <div>
                    <p className="text-[10px] text-muted">{t('bankLevel')}</p>
                    <p className="text-sm font-medium">{station.bank_level.toFixed(2)}</p>
                  </div>
                )}
                {station.warning_level !== null && (
                  <div>
                    <p className="text-[10px] text-muted">{t('thresholdWarning')}</p>
                    <p className="text-sm font-medium text-status-watch">{station.warning_level.toFixed(2)}</p>
                  </div>
                )}
                {station.critical_level !== null && (
                  <div>
                    <p className="text-[10px] text-muted">{t('thresholdCritical')}</p>
                    <p className="text-sm font-medium text-status-critical">{station.critical_level.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-muted">
                <span>{t('lastUpdated', { time: format(new Date(latestReading.ts), 'd MMM yyyy HH:mm', { locale: th }) })}</span>
              </div>
              {isStale && (
                <div className="flex items-center gap-1 text-xs text-status-watch mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{t('staleWarning')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-4">
            <div className="flex bg-surface p-1 rounded-lg w-full max-w-[200px]">
              <button 
                onClick={() => setDays(1)}
                className={`flex-1 py-1.5 text-xs text-center rounded-md font-medium transition-colors ${days === 1 ? 'bg-white shadow-sm text-primary' : 'text-text hover:bg-white/50'}`}
              >
                {t('history24h')}
              </button>
              <button 
                onClick={() => setDays(7)}
                className={`flex-1 py-1.5 text-xs text-center rounded-md font-medium transition-colors ${days === 7 ? 'bg-white shadow-sm text-primary' : 'text-text hover:bg-white/50'}`}
              >
                {t('history7d')}
              </button>
            </div>
            
            <div className="w-full overflow-hidden">
              {isHistoryLoading ? (
                <div className="h-64 bg-surface rounded-md animate-pulse"></div>
              ) : (
                <StationChart data={history || []} station={station} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
