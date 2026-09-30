import { useTranslations } from 'next-intl';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import type { StatusLevel } from '@/hooks/useAreas';

export function StatusBadge({ status, className = '' }: { status: StatusLevel, className?: string }) {
  const t = useTranslations('status');
  
  const config = {
    normal: { bg: 'bg-[#3B82F6] text-white', icon: CheckCircle2, label: 'normal' },
    watch: { bg: 'bg-[#F59E0B] text-white', icon: AlertTriangle, label: 'watch' },
    critical: { bg: 'bg-[#EF4444] text-white', icon: AlertCircle, label: 'critical' },
    nodata: { bg: 'bg-[#9CA3AF] text-white', icon: HelpCircle, label: 'noThreshold' }
  };

  const { bg, icon: Icon, label } = config[status] || config.nodata;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold shadow-sm ${bg} ${className}`}>
      <Icon className="w-4 h-4" />
      {t(label)}
    </span>
  );
}

export type Trend = 'up' | 'down' | 'stable' | 'unknown';

export function TrendArrow({ trend, className = '' }: { trend: Trend, className?: string }) {
  const t = useTranslations('station');

  if (trend === 'up') return <ArrowUp className={`w-4 h-4 text-status-critical ${className}`} aria-label={t('trendUp')} />;
  if (trend === 'down') return <ArrowDown className={`w-4 h-4 text-status-normal ${className}`} aria-label={t('trendDown')} />;
  if (trend === 'stable') return <ArrowRight className={`w-4 h-4 text-status-nodata ${className}`} aria-label={t('trendStable')} />;
  return null;
}
