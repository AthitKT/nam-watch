import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { StatusLevel } from '@/hooks/useAreas';
import { useTranslations } from 'next-intl';

interface AreaCardProps {
  id: string;
  name: string;
  status: StatusLevel;
  lastUpdated: string | null;
  stationCount: number;
}

export function AreaCard({ id, name, status, lastUpdated, stationCount }: AreaCardProps) {
  const t = useTranslations('home');

  const getMinutesAgo = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  const minutesAgo = getMinutesAgo(lastUpdated);

  return (
    <Link href={`/areas/${id}`} className="block transition-transform active:scale-[0.98]">
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{name}</h3>
          <StatusBadge status={status} />
        </div>
        
        <div className="flex justify-between items-end text-sm text-muted">
          <span>{stationCount} สถานี</span>
          <span>
            {minutesAgo !== null 
              ? t('updatedAgo', { minutes: minutesAgo }) 
              : t('noData')}
          </span>
        </div>
      </div>
    </Link>
  );
}
