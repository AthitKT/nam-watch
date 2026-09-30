/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { getStationStatus, StatusLevel } from './useAreas';

export interface MapStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  area_name: string;
  status: StatusLevel;
  latest_reading: any;
}

export function useAllStations() {
  return useQuery({
    queryKey: ['allStations'],
    queryFn: async (): Promise<MapStation[]> => {
      const supabase = createClient();
      
      const { data: stations, error: stationsErr } = await supabase
        .from('stations')
        .select(`
          id, name, lat, lon, type, warning_level, critical_level, bank_level, unit,
          area:areas(name_th)
        `)
        .not('lat', 'is', null)
        .not('lon', 'is', null);
        
      if (stationsErr) throw stationsErr;

      const stationIds = stations.map((s: any) => s.id);
      
      let readings: any[] = [];
      if (stationIds.length > 0) {
        // We fetch chunks if needed, but <1000 stations is fine for a single IN clause mostly
        const { data: r, error: rErr } = await supabase
          .from('latest_readings')
          .select('*')
          .in('station_id', stationIds);
        if (rErr) throw rErr;
        readings = r || [];
      }

      return stations.map((s: any) => {
        const reading = readings.find(r => r.station_id === s.id);
        return {
          id: s.id,
          name: s.name,
          lat: s.lat,
          lng: s.lon,
          type: s.type,
          area_name: s.area?.name_th || '',
          status: getStationStatus(s, reading),
          latest_reading: reading || null
        };
      });
    }
  });
}
