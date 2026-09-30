import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThaiWaterSource } from './thaiwater';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('ThaiWaterSource', () => {
  let source: ThaiWaterSource;

  beforeEach(() => {
    source = new ThaiWaterSource();
    fetchMock.mockReset();
  });

  it('fetches and maps canal stations correctly', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        result: 'OK',
        data: [{
          station: {
            canal_oldcode: 'WL.LBK.02',
            canal_name: { th: 'คลองบางหลวง' },
            canal_lat: 13.7,
            canal_long: 100.5,
            bank: 1.5,
            warning_level: 1.0,
            critical_level: 1.3
          },
          agency: { agency_name: { th: 'สสน.' } },
          geocode: {
            province_code: '10',
            amphoe_name: { th: 'เขตบางกอกใหญ่' }
          },
          canal_value: 0.8,
          canal_datetime: '2026-09-30 15:00',
          situation_level: 1
        }]
      })
    });
    // mock rivers as empty
    fetchMock.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ result: 'OK', waterlevel_data: { data: [] } }) });
    // mock gates with one passing record
    fetchMock.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({
      result: 'OK',
      watergate_data: {
        data: [{
          station: {
            tele_station_oldcode: 'G.1',
            tele_station_name: { th: 'ประตูน้ำทดสอบ' },
            tele_station_lat: 14.1,
            tele_station_long: 100.1
          },
          geocode: { province_code: '13', amphoe_name: { th: 'เมืองปทุมธานี' } }
        }]
      }
    })});

    const stations = await source.fetchStations();
    expect(stations).toHaveLength(2); // 1 canal, 1 gate
    expect(stations[1]).toEqual({
      id: 'tw-G.1',
      sourceId: 'thaiwater',
      name: 'ประตูน้ำทดสอบ',
      agency: 'สสน.',
      type: 'watergate',
      lat: 14.1,
      lon: 100.1,
      areaId: 'เมืองปทุมธานี',
      bankLevel: null,
      warningLevel: null,
      criticalLevel: null,
      unit: 'm'
    });
    expect(stations[0]).toEqual({
      id: 'tw-WL.LBK.02',
      sourceId: 'thaiwater',
      name: 'คลองบางหลวง',
      agency: 'สสน.',
      type: 'canal',
      lat: 13.7,
      lon: 100.5,
      areaId: 'บางกอกใหญ่',
      bankLevel: 1.5,
      warningLevel: 1.0,
      criticalLevel: 1.3,
      unit: 'm'
    });
  });

  it('fetches and maps readings correctly', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        result: 'OK',
        data: [{
          station: { canal_oldcode: 'WL.LBK.02', canal_name: { th: 'test' }, canal_lat: 1, canal_long: 1 },
          geocode: { province_code: '10', amphoe_name: { th: 'บางกอกใหญ่' } },
          canal_value: 0.8,
          canal_out: null,
          canal_datetime: '2026-09-30 15:00',
          situation_level: 1
        }]
      })
    });
    fetchMock.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ result: 'OK' }) });
    fetchMock.mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ result: 'OK' }) });

    const readings = await source.fetchReadings();
    expect(readings).toHaveLength(1);
    expect(readings[0].stationId).toBe('tw-WL.LBK.02');
    expect(readings[0].level).toBe(0.8);
    expect(readings[0].situationLevel).toBe(1);
    // JS Date check (UTC vs local)
    expect(readings[0].ts.getTime()).toBe(new Date('2026-09-30T15:00:00+07:00').getTime());
  });
});
