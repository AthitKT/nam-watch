import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { getStationStatus } from './useAreas';

export function useAreaDetails(areaId: string) {
  return useQuery({
    queryKey: ['areaDetails', areaId],
    queryFn: async () => {
      if (!areaId) return null;
      const supabase = createClient();
      
      const { data: area, error: areaErr } = await supabase
        .from('areas')
        .select('*')
        .eq('id', areaId)
        .single();
        
      if (areaErr) throw areaErr;

      const { data: stations, error: stationsErr } = await supabase
        .from('stations')
        .select('*')
        .eq('area_id', areaId)
        .order('name');
        
      if (stationsErr) throw stationsErr;

      let readings: any[] = [];
      if (stations.length > 0) {
        const { data: r, error: rErr } = await supabase
          .from('latest_readings')
          .select('*')
          .in('station_id', stations.map(s => s.id));
        if (rErr) throw rErr;
        readings = r || [];
      }

      const stationsWithData = stations.map(station => {
        const reading = readings.find(r => r.station_id === station.id) || null;
        return {
          ...station,
          reading,
          status: getStationStatus(station, reading)
        };
      });

      return {
        area,
        stations: stationsWithData
      };
    },
    enabled: !!areaId
  });
}
