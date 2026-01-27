import { parseDuration } from './duration.helper';

describe('parseDuration', () => {
  describe('string duration parsing', () => {
    it('should parse seconds correctly', () => {
      expect(parseDuration('30s')).toBe(30);
      expect(parseDuration('60s')).toBe(60);
    });

    it('should parse minutes correctly', () => {
      expect(parseDuration('5m')).toBe(300);
      expect(parseDuration('30m')).toBe(1800);
      expect(parseDuration('60m')).toBe(3600);
    });

    it('should parse hours correctly', () => {
      expect(parseDuration('1h')).toBe(3600);
      expect(parseDuration('2h')).toBe(7200);
      expect(parseDuration('24h')).toBe(86400);
    });

    it('should parse days correctly', () => {
      expect(parseDuration('1d')).toBe(86400);
      expect(parseDuration('7d')).toBe(604800);
    });
  });

  describe('numeric duration handling', () => {
    it('should return number as-is', () => {
      expect(parseDuration(300)).toBe(300);
      expect(parseDuration(3600)).toBe(3600);
    });
  });

  describe('invalid duration handling', () => {
    it('should handle invalid format by parsing as number', () => {
      expect(parseDuration('123')).toBe(123);
    });

    it('should default to 3600 for completely invalid input', () => {
      expect(parseDuration('invalid')).toBe(3600);
    });
  });
});
