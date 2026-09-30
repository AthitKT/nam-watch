import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';

export function useStationHistory(stationId: string, days: number = 1) {
  return useQuery({
    queryKey: ['stationHistory', stationId, days],
    queryFn: async () => {
      if (!stationId) return null;
      const supabase = createClient();
      
      // Calculate time boundary
      const dateBoundary = new Date();
      dateBoundary.setDate(dateBoundary.getDate() - days);
      
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('station_id', stationId)
        .gte('ts', dateBoundary.toISOString())
        .order('ts', { ascending: true }); // Chronological for charts
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!stationId
  });
}
