import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';

export type StatusLevel = 'normal' | 'watch' | 'critical' | 'nodata';

// Helper to determine status from a reading and station
export function getStationStatus(station: any, reading: any): StatusLevel {
  if (!reading || !reading.ts) return 'nodata';
  
  const isStale = (new Date().getTime() - new Date(reading.ts).getTime()) > 24 * 60 * 60 * 1000;
  if (isStale) return 'nodata';

  if (station.critical_level !== null && reading.level !== null && reading.level >= station.critical_level) {
    return 'critical';
  }
  if (station.warning_level !== null && reading.level !== null && reading.level >= station.warning_level) {
    return 'watch';
  }
  if (station.bank_level !== null && reading.level !== null && reading.level >= station.bank_level) {
    return 'critical'; // Exceeds bank
  }
  if (reading.situation_level === 4 || reading.situation_level === 5) return 'critical';
  if (reading.situation_level === 3) return 'watch';

  return 'normal';
}

export function useAreas(province: 'BKK' | 'PTT') {
  return useQuery({
    queryKey: ['areas', province],
    queryFn: async () => {
      const supabase = createClient();
      
      // Fetch areas
      const { data: areas, error: areasErr } = await supabase
        .from('areas')
        .select('*')
        .eq('province', province)
        .order('name_th');
        
      if (areasErr) throw areasErr;

      // Fetch stations for these areas
      const areaIds = areas.map(a => a.id);
      const { data: stations, error: stationsErr } = await supabase
        .from('stations')
        .select('id, area_id, warning_level, critical_level, bank_level')
        .in('area_id', areaIds);
        
      if (stationsErr) throw stationsErr;

      // Fetch latest readings for these stations
      const stationIds = stations.map(s => s.id);
      let readings: any[] = [];
      if (stationIds.length > 0) {
        const { data: r, error: rErr } = await supabase
          .from('latest_readings')
          .select('*')
          .in('station_id', stationIds);
        if (rErr) throw rErr;
        readings = r || [];
      }

      // Compute aggregated status per area
      return areas.map(area => {
        const areaStations = stations.filter(s => s.area_id === area.id);
        const areaStatuses = areaStations.map(station => {
          const reading = readings.find(r => r.station_id === station.id);
          return getStationStatus(station, reading);
        });

        let highestStatus: StatusLevel = 'nodata';
        if (areaStatuses.includes('critical')) highestStatus = 'critical';
        else if (areaStatuses.includes('watch')) highestStatus = 'watch';
        else if (areaStatuses.includes('normal')) highestStatus = 'normal';

        // Find the most recent update time
        const areaReadings = readings.filter(r => areaStations.some(s => s.id === r.station_id));
        const lastUpdated = areaReadings.length > 0
          ? areaReadings.reduce((latest, curr) => new Date(latest.ts) > new Date(curr.ts) ? latest : curr).ts
          : null;

        return {
          ...area,
          status: highestStatus,
          stationCount: areaStations.length,
          lastUpdated
        };
      });
    }
  });
}
