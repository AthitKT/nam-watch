import { WaterStatus, Trend } from '@/lib/status';
import { useTranslations } from 'next-intl';

export function StatusBadge({ status }: { status: WaterStatus }) {
  const t = useTranslations('status');
  
  const colors = {
    normal: 'bg-status-normal text-white',
    watch: 'bg-status-watch text-white',
    critical: 'bg-status-critical text-white',
    'no-data': 'bg-status-nodata text-white'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {t(status === 'no-data' ? 'noThreshold' : status)}
    </span>
  );
}

export function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === 'rising') return <span className="text-status-critical" aria-label="ระดับน้ำเพิ่มขึ้น">↑</span>;
  if (trend === 'falling') return <span className="text-status-normal" aria-label="ระดับน้ำลดลง">↓</span>;
  return <span className="text-status-nodata" aria-label="ระดับน้ำคงที่">→</span>;
}
