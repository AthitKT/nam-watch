import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';

export function useStationHistory(stationId: string, days: number = 1) {
  return useQuery({
    queryKey: ['stationHistory', stationId, days],
    queryFn: async () => {
      if (!stationId) return null;
      const supabase = createClient();
      
      // Fetch latest N records instead of strict time boundary to handle stale/mock data
      // Assume ~48 records for 24h, ~336 records for 7 days
      const limit = days === 1 ? 48 : 336;
      
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('station_id', stationId)
        .order('ts', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      // Reverse array to render chronologically in Recharts
      return (data || []).reverse();
    },
    enabled: !!stationId
  });
}
