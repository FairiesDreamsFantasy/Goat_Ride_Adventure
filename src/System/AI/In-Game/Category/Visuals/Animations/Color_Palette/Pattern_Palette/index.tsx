/**
 * Visuals Pattern Palette Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Color_Palette/Pattern_Palette/index.tsx
 *
 * Implements procedural surface pattern generation (checkers, asphalt lane markers,
 * chevron warning hazards, crystalline facets) eliminating hardcoded canvas drawing constants.
 */

export interface SurfacePatternSpec {
  patternId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  repeatFrequencyMeters: number;
  dutyCycle: number;
}

export const PATTERN_REGISTRY: Record<string, SurfacePatternSpec> = {
  lane_striping_dashed: {
    patternId: 'lane_striping_dashed',
    name: 'Road Lane Striping Dashed',
    primaryColor: '#FFFFFF',
    secondaryColor: 'transparent',
    repeatFrequencyMeters: 6.0,
    dutyCycle: 0.4
  },
  curb_alternating_red_white: {
    patternId: 'curb_alternating_red_white',
    name: 'Alternating Racing Curb',
    primaryColor: '#E53935',
    secondaryColor: '#FFFFFF',
    repeatFrequencyMeters: 4.0,
    dutyCycle: 0.5
  },
  hazard_chevron: {
    patternId: 'hazard_chevron',
    name: 'Hazard Warning Chevron',
    primaryColor: '#FFEB3B',
    secondaryColor: '#212121',
    repeatFrequencyMeters: 3.0,
    dutyCycle: 0.5
  },
  cyber_neon_grid: {
    patternId: 'cyber_neon_grid',
    name: 'Cyber Neon Road Plating',
    primaryColor: '#00E5FF',
    secondaryColor: '#12005E',
    accentColor: '#FF0055',
    repeatFrequencyMeters: 8.0,
    dutyCycle: 0.15
  }
};

/**
 * Procedurally computes pattern state at distance z.
 */
export function evaluatePatternAtZ(
  z: number,
  pattern: SurfacePatternSpec = PATTERN_REGISTRY.lane_striping_dashed
): { activeColor: string; phase: number } {
  const normalizedZ = Math.abs(z) % pattern.repeatFrequencyMeters;
  const phase = normalizedZ / pattern.repeatFrequencyMeters;
  const isPrimary = phase < pattern.dutyCycle;
  return {
    activeColor: isPrimary ? pattern.primaryColor : pattern.secondaryColor,
    phase
  };
}

export const PATTERN_PALETTE_DATA = {
  PATTERN_REGISTRY,
  evaluatePatternAtZ
};

export default PATTERN_PALETTE_DATA;
