export interface Station {
  id: string;
  sourceId: string;
  name: string;
  agency?: string;
  type: 'river' | 'canal' | 'watergate';
  lat: number;
  lon: number;
  areaId: string | null; // e.g. amphoe name mapped to BKK-XX
  bankLevel: number | null;
  warningLevel: number | null;
  criticalLevel: number | null;
  unit: string;
}

export interface Reading {
  stationId: string;
  ts: Date;
  level: number | null;
  levelOut: number | null;
  situationLevel: number | null; // 1-5 from ThaiWater
  unit: string;
}

export interface WaterSource {
  id: string;
  fetchStations(): Promise<Station[]>;
  fetchReadings(since?: Date): Promise<Reading[]>;
}
