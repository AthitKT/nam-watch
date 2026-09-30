import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';

export function useStationDetails(stationId: string) {
  return useQuery({
    queryKey: ['stationDetails', stationId],
    queryFn: async () => {
      if (!stationId) return null;
      const supabase = createClient();
      
      const { data: station, error } = await supabase
        .from('stations')
        .select(`
          *,
          area:areas(*)
        `)
        .eq('id', stationId)
        .single();
        
      if (error) throw error;
      return station;
    },
    enabled: !!stationId
  });
}
