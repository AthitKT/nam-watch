import { useStationHistory } from '@/hooks/useStationHistory';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export function StationSparkline({ stationId, status }: { stationId: string, status: string }) {
  const { data, isLoading } = useStationHistory(stationId, 1);

  if (isLoading || !data || data.length < 2) {
    return <div className="h-[40px] w-24 bg-surface rounded-md animate-pulse"></div>;
  }

  // Choose color based on status
  let color = '#3B82F6'; // Normal (primary)
  if (status === 'watch') color = '#F59E0B';
  if (status === 'critical') color = '#EF4444';
  if (status === 'nodata') color = '#9CA3AF';

  return (
    <div className="h-[40px] w-24 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="level" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
