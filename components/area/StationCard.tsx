/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { StatusBadge, TrendArrow, Trend } from '@/components/ui/StatusBadge';
import { useTranslations } from 'next-intl';

import { StationSparkline } from './StationSparkline';

export function StationCard({ station }: { station: any }) {
  const t = useTranslations('station');
  
  const isPtt = station.type === 'watergate'; // In our db, PTT mostly uses watergates or we can check province if available.
  const hasReading = !!station.reading;
  const isStale = hasReading && (new Date().getTime() - new Date(station.reading.ts).getTime()) > 24 * 60 * 60 * 1000;
  
  const trend: Trend = 'unknown';
  if (hasReading && station.reading.trend !== undefined) {
    // Actually the API doesn't provide trend directly, we can infer it or we just omit for now, or just leave as unknown
    // Let's omit trend icon if we don't have enough data points, or just render it if we compute it.
  }

  return (
    <Link href={`/stations/${encodeURIComponent(station.id)}`} className="block transition-transform active:scale-[0.98]">
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-text">{station.name}</h3>
            <p className="text-xs text-muted mt-1">{station.agency}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <TrendArrow trend={trend} />
              <StatusBadge status={station.status} />
            </div>
            <StationSparkline stationId={station.id} status={station.status} />
          </div>
        </div>

        {(!hasReading || isStale) ? (
          <div className="mt-2 text-sm text-muted bg-surface py-2 px-3 rounded-md border border-dashed">
            {t('noData')}
          </div>
        ) : (
          <div className="flex gap-4 mt-2">
            {isPtt ? (
              <>
                <div className="flex-1 bg-surface p-2 rounded-md">
                  <p className="text-xs text-muted mb-1">{t('gateIn')}</p>
                  <p className="font-semibold text-lg">
                    {station.reading.level !== null ? station.reading.level.toFixed(2) : '-'} <span className="text-xs font-normal text-muted">{station.unit}</span>
                  </p>
                </div>
                <div className="flex-1 bg-surface p-2 rounded-md">
                  <p className="text-xs text-muted mb-1">{t('gateOut')}</p>
                  <p className="font-semibold text-lg">
                    {station.reading.level_out !== null ? station.reading.level_out.toFixed(2) : '-'} <span className="text-xs font-normal text-muted">{station.unit}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-surface p-2 rounded-md flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted mb-1">{t(station.unit.includes('MSL') ? 'levelMsl' : 'levelM')}</p>
                  <p className="font-semibold text-xl text-primary-dark">
                    {station.reading.level !== null ? station.reading.level.toFixed(2) : '-'} 
                    <span className="text-sm font-normal text-muted ml-1">{station.unit}</span>
                  </p>
                </div>
                {station.bank_level !== null && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted">{t('bankLevel')}</p>
                    <p className="text-sm font-medium text-status-critical">{station.bank_level.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
