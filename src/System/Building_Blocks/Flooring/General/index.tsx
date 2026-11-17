/**
 * Building Blocks Flooring Module
 * Defines surfaces, acoustic resonance, friction coefficients, and structural floor tiles.
 */

export interface SurfaceProperties {
  friction: number;
  acousticReverb: number;
  stepSound: string;
}

export const SURFACE_TYPES: Record<string, SurfaceProperties> = {
  grass: { friction: 0.85, acousticReverb: 0.1, stepSound: 'grass_thud' },
  stone: { friction: 0.95, acousticReverb: 0.4, stepSound: 'stone_clop' },
  ice: { friction: 0.2, acousticReverb: 0.2, stepSound: 'ice_slide' },
  sand: { friction: 0.7, acousticReverb: 0.05, stepSound: 'sand_crunch' },
  wood: { friction: 0.9, acousticReverb: 0.3, stepSound: 'wood_clack' },
  metal: { friction: 0.88, acousticReverb: 0.5, stepSound: 'metal_echo' },
  asphalt: { friction: 0.92, acousticReverb: 0.15, stepSound: 'asphalt_clop' }
};

export function getSurfaceProperty(surfaceType: string): SurfaceProperties {
  return SURFACE_TYPES[surfaceType] || SURFACE_TYPES['grass'];
}
