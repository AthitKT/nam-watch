import { Link } from '@/i18n/routing';
import { StatusBadge, TrendArrow } from '@/components/ui/StatusBadge';
import type { StatusLevel } from '@/hooks/useAreas';
import { useTranslations } from 'next-intl';

interface AreaCardProps {
  id: string;
  name: string;
  type: string;
  status: StatusLevel;
  lastUpdated: string | null;
  stationCount: number;
}

export function AreaCard({ id, name, type, status, lastUpdated, stationCount }: AreaCardProps) {
  const tHome = useTranslations('home');
  const tArea = useTranslations('area');

  const getMinutesAgo = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  const minutesAgo = getMinutesAgo(lastUpdated);
  const typeLabel = type === 'khet' ? tArea('khet') : tArea('amphoe');

  return (
    <Link href={`/areas/${encodeURIComponent(id)}`} className="block transition-transform active:scale-[0.98]">
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-text">
            {typeLabel}{name}
          </h3>
          <div className="flex items-center gap-2">
            <TrendArrow trend="unknown" /> {/* We don't have aggregated trend yet, use unknown */}
            <StatusBadge status={status} />
          </div>
        </div>
        
        <div className="flex justify-between items-end text-sm text-muted">
          <span>{stationCount} สถานี</span>
          <span>
            {minutesAgo !== null 
              ? tHome('updatedAgo', { minutes: minutesAgo }) 
              : tHome('noData')}
          </span>
        </div>
      </div>
    </Link>
  );
}
