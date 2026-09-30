import { supabase } from './client';
import { Station, Reading } from '../water-sources/types';

export async function upsertStations(stations: Station[]) {
  if (stations.length === 0) return;
  
  // Deduplicate by ID
  const uniqueStations = Array.from(
    new Map(stations.map(s => [s.id, s])).values()
  );

  const mapped = uniqueStations.map(s => ({
    id: s.id,
    source_id: s.sourceId,
    name: s.name,
    agency: s.agency,
    type: s.type,
    lat: s.lat,
    lon: s.lon,
    area_id: s.areaId,
    bank_level: s.bankLevel,
    warning_level: s.warningLevel,
    critical_level: s.criticalLevel,
    unit: s.unit
  }));
  
  const { error } = await supabase
    .from('stations')
    .upsert(mapped, { onConflict: 'id' });
    
  if (error) throw new Error(`Failed to upsert stations: ${error.message}`);
}

export async function upsertReadings(readings: Reading[]) {
  if (readings.length === 0) return;
  
  // Deduplicate by composite key (station_id + ts)
  const uniqueReadings = Array.from(
    new Map(readings.map(r => [`${r.stationId}-${r.ts.getTime()}`, r])).values()
  );

  const mapped = uniqueReadings.map(r => ({
    station_id: r.stationId,
    ts: r.ts.toISOString(),
    level: r.level,
    level_out: r.levelOut,
    situation_level: r.situationLevel,
    unit: r.unit,
  }));

  const { error } = await supabase
    .from('readings')
    .upsert(mapped, { onConflict: 'station_id, ts' });
    
  if (error) throw new Error(`Failed to upsert readings: ${error.message}`);
}

export async function pruneReadings(days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const { error } = await supabase
    .from('readings')
    .delete()
    .lt('ts', cutoff.toISOString());
    
  if (error) throw new Error(`Failed to prune readings: ${error.message}`);
}
