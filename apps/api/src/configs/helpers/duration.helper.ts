/**
 * Convert duration string to seconds
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 *
 * Examples:
 * - "30s" -> 30
 * - "5m" -> 300
 * - "1h" -> 3600
 * - "7d" -> 604800
 *
 * @param duration - Duration string (e.g., "5m", "1h", "7d")
 * @returns Number of seconds, or the input if already a number
 */
export function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') {
    return duration;
  }

  const match = duration.match(/^(\d+)([smhd])$/);

  if (!match) {
    const parsed = parseInt(duration, 10);
    return isNaN(parsed) ? 3600 : parsed; // Default to 1 hour if invalid
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  const multipliers: Record<string, number> = {
    s: 1, // seconds
    m: 60, // minutes
    h: 3600, // hours
    d: 86400, // days
  };

  return numValue * multipliers[unit];
}
