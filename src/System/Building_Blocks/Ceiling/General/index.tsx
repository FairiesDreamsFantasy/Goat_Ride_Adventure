/**
 * Building Blocks Ceiling Module
 * Scientific acoustic reflection and vertical enclosure definitions for subterranean and indoor spaces.
 */

export interface CeilingSpec {
  heightFeet: number;
  reflectionFactor: number;
  hasVentShafts: boolean;
}

export function calculateCeilingAcoustics(heightFeet: number): number {
  // Lower ceiling increases acoustic reflection density
  return Math.max(0.1, Math.min(1.0, 30 / Math.max(8, heightFeet)));
}
