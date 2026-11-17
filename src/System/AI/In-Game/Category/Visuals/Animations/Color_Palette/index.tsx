/**
 * Visuals Color Palette Subsystem Entry Point
 * System/AI/In-Game/Category/Visuals/Animations/Color_Palette/index.tsx
 *
 * Coordinates procedural environmental color generation, lighting gradients,
 * Pattern palettes, Texture palettes, and Monochrome accessibility modes.
 */

import { PATTERN_PALETTE_DATA, PATTERN_REGISTRY, evaluatePatternAtZ } from './Pattern_Palette';
import { TEXTURE_PALETTE_DATA, TEXTURE_REGISTRY, calculateTextureNoise } from './Texture_Palette';
import {
  MONOCHROME_DATA,
  MONOCHROME_PROFILES,
  applyMonochromeProfile,
  calculateLuminanceBT709,
  hexToGrayscale
} from './Monochrome';

export interface BiomeColorTheme {
  id: string;
  name: string;
  skyTopHex: string;
  skyBottomHex: string;
  roadSurfaceHex: string;
  roadStripeHex: string;
  curbLeftHex: string;
  curbRightHex: string;
  fogColorHex: string;
  fogDensity: number;
}

export const BIOME_COLOR_THEMES: Record<string, BiomeColorTheme> = {
  nebula_plains: {
    id: 'nebula_plains',
    name: 'Nebula Plains Cosmic Theme',
    skyTopHex: '#08011F',
    skyBottomHex: '#2A0845',
    roadSurfaceHex: '#140D26',
    roadStripeHex: '#00E5FF',
    curbLeftHex: '#D500F9',
    curbRightHex: '#651FFF',
    fogColorHex: '#1A0033',
    fogDensity: 0.0012
  },
  cyber_city: {
    id: 'cyber_city',
    name: 'Cyber City Neon Theme',
    skyTopHex: '#0A0E17',
    skyBottomHex: '#1F2937',
    roadSurfaceHex: '#111827',
    roadStripeHex: '#FBBF24',
    curbLeftHex: '#EF4444',
    curbRightHex: '#3B82F6',
    fogColorHex: '#111827',
    fogDensity: 0.0018
  },
  mountain_pass: {
    id: 'mountain_pass',
    name: 'Alpine Mountain Ridge Theme',
    skyTopHex: '#1E3A8A',
    skyBottomHex: '#60A5FA',
    roadSurfaceHex: '#374151',
    roadStripeHex: '#F3F4F6',
    curbLeftHex: '#DC2626',
    curbRightHex: '#FFFFFF',
    fogColorHex: '#93C5FD',
    fogDensity: 0.0008
  },
  jungle_forest: {
    id: 'jungle_forest',
    name: 'Primeval Jungle Canopy Theme',
    skyTopHex: '#064E3B',
    skyBottomHex: '#10B981',
    roadSurfaceHex: '#27272A',
    roadStripeHex: '#A7F3D0',
    curbLeftHex: '#059669',
    curbRightHex: '#F59E0B',
    fogColorHex: '#064E3B',
    fogDensity: 0.0022
  },
  cavern_caves: {
    id: 'cavern_caves',
    name: 'Subterranean Cavern Vault Theme',
    skyTopHex: '#000000',
    skyBottomHex: '#1C1917',
    roadSurfaceHex: '#292524',
    roadStripeHex: '#78716C',
    curbLeftHex: '#44403C',
    curbRightHex: '#A8A29E',
    fogColorHex: '#0C0A09',
    fogDensity: 0.003
  }
};

/**
 * Resolves procedural color theme for level across the 400-level spectrum.
 */
export function resolveThemeForLevel(level: number): BiomeColorTheme {
  const themeKeys = Object.keys(BIOME_COLOR_THEMES);
  const index = Math.abs(Math.floor((level - 1) / 10)) % themeKeys.length;
  return BIOME_COLOR_THEMES[themeKeys[index]];
}

export const COLOR_PALETTE_DATA = {
  BIOME_COLOR_THEMES,
  resolveThemeForLevel,
  PATTERNS: PATTERN_PALETTE_DATA,
  TEXTURES: TEXTURE_PALETTE_DATA,
  MONOCHROME: MONOCHROME_DATA,
  PATTERN_REGISTRY,
  TEXTURE_REGISTRY,
  MONOCHROME_PROFILES,
  evaluatePatternAtZ,
  calculateTextureNoise,
  applyMonochromeProfile,
  calculateLuminanceBT709,
  hexToGrayscale
};

export * from './Pattern_Palette';
export * from './Texture_Palette';
export * from './Monochrome';

export default COLOR_PALETTE_DATA;
