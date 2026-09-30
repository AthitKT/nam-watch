import { z } from 'zod';
import { Station, Reading, WaterSource } from './types';

// Zod schemas for ThaiWater endpoints
export const ThaiWaterGeocodeSchema = z.object({
  province_code: z.string().nullable().optional(),
  amphoe_name: z.object({
    th: z.string(),
    en: z.string().optional()
  }).nullable().optional()
});

export const ThaiWaterAgencySchema = z.object({
  agency_name: z.object({ th: z.string() }).optional(),
  agency_shortname: z.object({ en: z.string() }).optional()
});

// Canal stations schema
export const CanalDataSchema = z.object({
  station: z.object({
    canal_oldcode: z.string().optional(),
    canal_name: z.object({ th: z.string() }),
    canal_lat: z.coerce.number(),
    canal_long: z.coerce.number(),
    bank: z.coerce.number().nullable().optional(),
    warning_level: z.coerce.number().nullable().optional(),
    critical_level: z.coerce.number().nullable().optional()
  }),
  agency: ThaiWaterAgencySchema.optional(),
  geocode: ThaiWaterGeocodeSchema.optional(),
  canal_value: z.coerce.number().nullable().optional(),
  canal_out: z.coerce.number().nullable().optional(),
  canal_datetime: z.string().optional(),
  situation_level: z.number().nullable().optional()
});

// Tele waterlevel (River) schema
export const RiverDataSchema = z.object({
  station: z.object({
    tele_station_oldcode: z.string().optional(),
    tele_station_name: z.object({ th: z.string() }),
    tele_station_lat: z.coerce.number(),
    tele_station_long: z.coerce.number(),
    warning_level_m: z.coerce.number().nullable().optional(),
    critical_level_m: z.coerce.number().nullable().optional()
  }),
  agency: ThaiWaterAgencySchema.optional(),
  geocode: ThaiWaterGeocodeSchema.optional(),
  waterlevel_msl: z.coerce.number().nullable().optional(),
  waterlevel_datetime: z.string().optional(),
  situation_level: z.number().nullable().optional()
});

// Watergate schema
export const WatergateDataSchema = z.object({
  station: z.object({
    tele_station_oldcode: z.string().optional(),
    tele_station_name: z.object({ th: z.string() }),
    tele_station_lat: z.coerce.number(),
    tele_station_long: z.coerce.number(),
  }),
  agency: ThaiWaterAgencySchema.optional(),
  geocode: ThaiWaterGeocodeSchema.optional(),
  watergate_in: z.coerce.number().nullable().optional(),
  watergate_out: z.coerce.number().nullable().optional(),
  watergate_datetime_in: z.string().optional(),
  situation_level: z.number().nullable().optional()
});

export const ThaiWaterResponseSchema = z.object({
  result: z.string().optional(),
  data: z.array(z.any()).optional(),
  waterlevel_data: z.object({ data: z.array(z.any()) }).optional(),
  watergate_data: z.object({ data: z.array(z.any()) }).optional()
});

export class ThaiWaterSource implements WaterSource {
  id = 'thaiwater';
  private baseUrl = process.env.THAIWATER_API_BASE || 'https://api-v3.thaiwater.net/api/v1/thaiwater30';

  private async fetchApi(endpoint: string, retries = 3) {
    const url = `${this.baseUrl}${endpoint}`;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error('Received HTML instead of JSON (possible rate limit or WAF)');
        }
        
        const json = await res.json();
        return ThaiWaterResponseSchema.parse(json);
      } catch (err: unknown) {
        if (i === retries - 1) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(`ThaiWater API error after ${retries} tries on ${endpoint}: ${msg}`);
        }
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Unreachable');
  }

  private isBkkOrPtt(geocode?: z.infer<typeof ThaiWaterGeocodeSchema>) {
    // 10 = BKK, 13 = PTT
    return geocode?.province_code === '10' || geocode?.province_code === '13';
  }

  private normalizeAreaName(rawName?: string): string | null {
    if (!rawName) return null;
    let name = rawName.trim();
    name = name.replace(/^เขต\s*/, '').replace(/^อำเภอ\s*/, '');
    
    const VALID_AREAS = new Set([
      'คลองเตย', 'คลองสาน', 'คลองสามวา', 'คันนายาว', 'จตุจักร', 'จอมทอง',
      'ดอนเมือง', 'ดินแดง', 'ดุสิต', 'ตลิ่งชัน', 'ทวีวัฒนา', 'ทุ่งครุ',
      'ธนบุรี', 'บางเขน', 'บางแค', 'บางกอกใหญ่', 'บางกอกน้อย', 'บางกะปิ',
      'บางขุนเทียน', 'บางคอแหลม', 'บางซื่อ', 'บางนา', 'บางบอน', 'บางพลัด',
      'บางรัก', 'บึงกุ่ม', 'ปทุมวัน', 'ประเวศ', 'ป้อมปราบศัตรูพ่าย', 'พญาไท',
      'พระโขนง', 'พระนคร', 'ภาษีเจริญ', 'มีนบุรี', 'ยานนาวา', 'ราชเทวี',
      'ราษฎร์บูรณะ', 'ลาดกระบัง', 'ลาดพร้าว', 'วังทองหลาง', 'วัฒนา', 'สวนหลวง',
      'สะพานสูง', 'สัมพันธวงศ์', 'สาทร', 'สายไหม', 'หนองแขม', 'หนองจอก',
      'หลักสี่', 'ห้วยขวาง',
      'เมืองปทุมธานี', 'คลองหลวง', 'ธัญบุรี', 'หนองเสือ', 'ลาดหลุมแก้ว',
      'ลำลูกกา', 'สามโคก'
    ]);

    return VALID_AREAS.has(name) ? name : null;
  }

  // Parse YYYY-MM-DD HH:mm (assume local TH time, convert to UTC)
  private parseDate(dtStr?: string): Date | null {
    if (!dtStr) return null;
    const [date, time] = dtStr.split(' ');
    if (!date || !time) return null;
    // Create date as UTC by adding +07:00
    return new Date(`${date}T${time}:00+07:00`);
  }

  private processList<T>(
    list: unknown[], 
    schema: z.ZodType<T>, 
    stats: { total: number, valid: number, skipped: number, reasons: Record<string, number> },
    processor: (data: T) => void
  ) {
    stats.total += list.length;
    for (const item of list) {
      const parsed = schema.safeParse(item);
      if (!parsed.success) {
        stats.skipped++;
        const firstError = parsed.error.issues[0]?.path.join('.') || 'unknown';
        stats.reasons[`Schema mismatch: ${firstError}`] = (stats.reasons[`Schema mismatch: ${firstError}`] || 0) + 1;
        continue;
      }
      
      try {
        processor(parsed.data);
        stats.valid++;
      } catch (err: unknown) {
        stats.skipped++;
        const msg = err instanceof Error ? err.message : String(err);
        stats.reasons[msg] = (stats.reasons[msg] || 0) + 1;
      }
    }
  }

  private validateStats(stats: { total: number, valid: number, skipped: number, reasons: Record<string, number> }, context: string) {
    console.log(`[ThaiWater] ${context} stats: Total=${stats.total} Valid=${stats.valid} Skipped=${stats.skipped}`);
    if (stats.skipped > 0) {
      console.log(`[ThaiWater] ${context} skip reasons:`, stats.reasons);
    }
    if (stats.total > 0 && stats.valid === 0) {
      throw new Error(`All ${context} records failed validation.`);
    }
    if (stats.total > 0 && (stats.skipped / stats.total) > 0.2) {
      throw new Error(`Too many ${context} records failed validation (>20%).`);
    }
  }

  async fetchStations(): Promise<Station[]> {
    const stations: Station[] = [];
    const stats = { total: 0, valid: 0, skipped: 0, reasons: {} as Record<string, number> };

    // 1. Canals
    const canalRes = await this.fetchApi('/public/canal_waterlevel');
    this.processList(canalRes.data || [], CanalDataSchema, stats, (data) => {
      const st = data.station;
      if (!st.canal_name?.th) throw new Error('Missing name');
      if (isNaN(st.canal_lat) || isNaN(st.canal_long)) throw new Error('Invalid coords');
      
      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        stations.push({
          id: `tw-${st.canal_oldcode}`,
          sourceId: this.id,
          name: st.canal_name.th,
          agency: data.agency?.agency_name?.th || 'สสน.',
          type: 'canal',
          lat: st.canal_lat,
          lon: st.canal_long,
          areaId,
          bankLevel: st.bank || null,
          warningLevel: st.warning_level || null,
          criticalLevel: st.critical_level || null,
          unit: 'm'
        });
      }
    });

    // 2. Rivers
    const riverRes = await this.fetchApi('/public/waterlevel_load');
    this.processList(riverRes.waterlevel_data?.data || [], RiverDataSchema, stats, (data) => {
      const st = data.station;
      if (!st.tele_station_name?.th) throw new Error('Missing name');
      if (isNaN(st.tele_station_lat) || isNaN(st.tele_station_long)) throw new Error('Invalid coords');

      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        stations.push({
          id: `tw-${st.tele_station_oldcode}`,
          sourceId: this.id,
          name: st.tele_station_name.th,
          agency: data.agency?.agency_shortname?.en || 'HII',
          type: 'river',
          lat: st.tele_station_lat,
          lon: st.tele_station_long,
          areaId,
          bankLevel: null,
          warningLevel: st.warning_level_m || null,
          criticalLevel: st.critical_level_m || null,
          unit: 'm(MSL)'
        });
      }
    });

    // 3. Watergates
    const gateRes = await this.fetchApi('/public/watergate_load');
    this.processList(gateRes.watergate_data?.data || [], WatergateDataSchema, stats, (data) => {
      const st = data.station;
      if (!st.tele_station_name?.th) throw new Error('Missing name');
      if (isNaN(st.tele_station_lat) || isNaN(st.tele_station_long)) throw new Error('Invalid coords');

      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        stations.push({
          id: `tw-${st.tele_station_oldcode}`,
          sourceId: this.id,
          name: st.tele_station_name.th,
          agency: data.agency?.agency_name?.th || 'สสน.',
          type: 'watergate',
          lat: st.tele_station_lat,
          lon: st.tele_station_long,
          areaId,
          bankLevel: null,
          warningLevel: null,
          criticalLevel: null,
          unit: 'm'
        });
      }
    });

    this.validateStats(stats, 'stations');
    return stations;
  }

  async fetchReadings(): Promise<Reading[]> {
    const readings: Reading[] = [];
    const stats = { total: 0, valid: 0, skipped: 0, reasons: {} as Record<string, number> };

    // 1. Canals
    const canalRes = await this.fetchApi('/public/canal_waterlevel');
    this.processList(canalRes.data || [], CanalDataSchema, stats, (data) => {
      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        const ts = this.parseDate(data.canal_datetime);
        if (ts) {
          readings.push({
            stationId: `tw-${data.station.canal_oldcode}`,
            ts,
            level: data.canal_value ?? null,
            levelOut: data.canal_out ?? null,
            situationLevel: data.situation_level ?? null,
            unit: 'm'
          });
        } else {
          throw new Error('Invalid datetime');
        }
      }
    });

    // 2. Rivers
    const riverRes = await this.fetchApi('/public/waterlevel_load');
    this.processList(riverRes.waterlevel_data?.data || [], RiverDataSchema, stats, (data) => {
      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        const ts = this.parseDate(data.waterlevel_datetime);
        if (ts) {
          readings.push({
            stationId: `tw-${data.station.tele_station_oldcode}`,
            ts,
            level: data.waterlevel_msl ?? null,
            levelOut: null,
            situationLevel: data.situation_level ?? null,
            unit: 'm(MSL)'
          });
        } else {
          throw new Error('Invalid datetime');
        }
      }
    });

    // 3. Watergates
    const gateRes = await this.fetchApi('/public/watergate_load');
    this.processList(gateRes.watergate_data?.data || [], WatergateDataSchema, stats, (data) => {
      if (this.isBkkOrPtt(data.geocode)) {
        const areaId = this.normalizeAreaName(data.geocode?.amphoe_name?.th);
        if (!areaId) throw new Error('Unmatched area');

        const ts = this.parseDate(data.watergate_datetime_in);
        if (ts) {
          readings.push({
            stationId: `tw-${data.station.tele_station_oldcode}`,
            ts,
            level: data.watergate_in ?? null,
            levelOut: data.watergate_out ?? null,
            situationLevel: data.situation_level ?? null,
            unit: 'm'
          });
        } else {
          throw new Error('Invalid datetime');
        }
      }
    });

    this.validateStats(stats, 'readings');
    return readings;
  }
}
