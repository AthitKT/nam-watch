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
        const { data: r, error: rErr } = await supabase
          .from('latest_readings')
          .select('*')
          .limit(5000);
        if (rErr) throw rErr;
        readings = r || [];
      }

      const mappedStations = stations.map((s: any) => {
        const normalizeId = (id: string) => id.replace(/^tw-/, '');
        const reading = readings.find(r => normalizeId(r.station_id) === normalizeId(s.id));
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

      console.log(`[Map Loader] Total stations fetched: ${stations.length}`);
      console.log(`[Map Loader] Total readings fetched: ${readings.length}`);
      
      const sampleReading = readings[0];
      if (sampleReading) {
        console.log(`[Map Loader] Sample reading ts: ${sampleReading.ts}`);
        console.log(`[Map Loader] Now: ${new Date().toISOString()}`);
        const diffHours = (new Date().getTime() - new Date(sampleReading.ts).getTime()) / (1000 * 60 * 60);
        console.log(`[Map Loader] Sample age in hours: ${diffHours.toFixed(2)}`);
      }

      const activeCount = mappedStations.filter(s => s.status !== 'nodata').length;
      const grayCount = mappedStations.filter(s => s.status === 'nodata').length;
      console.log(`[Map Loader] Active status: ${activeCount}, Gray/Unknown: ${grayCount}`);

      return mappedStations;
    }
  });
}
