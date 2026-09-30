import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toStatus, toTrend, areaStatus, toFreshness } from './status';

describe('status logic', () => {
  describe('toStatus', () => {
    it('maps level 1 to normal', () => expect(toStatus(1)).toBe('normal'));
    it('maps level 2 to watch', () => expect(toStatus(2)).toBe('watch'));
    it('maps level 3 to watch', () => expect(toStatus(3)).toBe('watch'));
    it('maps level 4 to critical', () => expect(toStatus(4)).toBe('critical'));
    it('maps level 5 to critical', () => expect(toStatus(5)).toBe('critical'));
    it('maps null to no-data', () => expect(toStatus(null)).toBe('no-data'));
    it('returns no-data if freshness is no-data', () => expect(toStatus(1, 'no-data')).toBe('no-data'));
  });

  describe('toTrend', () => {
    it('returns steady for insufficient data', () => {
      expect(toTrend([])).toBe('steady');
      expect(toTrend([1])).toBe('steady');
    });
    
    it('returns rising when delta exceeds threshold', () => {
      expect(toTrend([1.0, 1.05])).toBe('rising');
    });

    it('returns falling when delta exceeds threshold', () => {
      expect(toTrend([1.0, 0.95])).toBe('falling');
    });

    it('returns steady when delta is within threshold', () => {
      expect(toTrend([1.0, 1.01])).toBe('steady');
      expect(toTrend([1.0, 0.99])).toBe('steady');
    });
  });

  describe('areaStatus', () => {
    it('returns critical if any station is critical', () => {
      expect(areaStatus(['normal', 'watch', 'critical'])).toBe('critical');
    });
    
    it('returns watch if worst is watch', () => {
      expect(areaStatus(['normal', 'watch', 'normal'])).toBe('watch');
    });
    
    it('returns normal if all are normal', () => {
      expect(areaStatus(['normal', 'normal'])).toBe('normal');
    });
    
    it('returns no-data for empty or all no-data', () => {
      expect(areaStatus([])).toBe('no-data');
      expect(areaStatus(['no-data'])).toBe('no-data');
    });
  });

  describe('toFreshness', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-30T10:00:00Z'));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('is fresh if < 60 mins', () => {
      expect(toFreshness(new Date('2026-09-30T09:10:00Z'))).toBe('fresh');
    });

    it('is stale if >= 60 mins and <= 24 hrs', () => {
      expect(toFreshness(new Date('2026-09-30T09:00:00Z'))).toBe('stale');
      expect(toFreshness(new Date('2026-09-29T11:00:00Z'))).toBe('stale');
    });

    it('is no-data if > 24 hrs', () => {
      expect(toFreshness(new Date('2026-09-29T09:00:00Z'))).toBe('no-data');
    });
  });
});
