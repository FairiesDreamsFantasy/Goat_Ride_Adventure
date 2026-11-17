/**
 * Visuals Pixelations Animation Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Pixelations/index.tsx
 *
 * Implements procedural pixel-grid downsampling, retro mosaic resolution filters,
 * Bayer matrix ordered dithering algorithms, and phosphor scanline calculations.
 */

import { DOT_MATRIX_DATA, rasterizeStringToDotMatrix, DEFAULT_DOT_MATRIX_CONFIG } from './Dot_Matrix';

export interface PixelationResolutionProfile {
  name: string;
  targetHorizontalPixels: number;
  targetVerticalPixels: number;
  ditherStrength: number;
  scanlineIntensity: number;
}

export const PIXELATION_PROFILES: Record<string, PixelationResolutionProfile> = {
  retro_cga: {
    name: 'CGA 320x200 Emulation',
    targetHorizontalPixels: 320,
    targetVerticalPixels: 200,
    ditherStrength: 0.65,
    scanlineIntensity: 0.28
  },
  arcade_classic: {
    name: 'Arcade 256x224 CRT',
    targetHorizontalPixels: 256,
    targetVerticalPixels: 224,
    ditherStrength: 0.45,
    scanlineIntensity: 0.35
  },
  ultra_low_lofi: {
    name: 'Lo-Fi 160x100 Grid',
    targetHorizontalPixels: 160,
    targetVerticalPixels: 100,
    ditherStrength: 0.85,
    scanlineIntensity: 0.5
  }
};

/**
 * 4x4 Bayer Dither Matrix for retro spatial halftoning
 */
export const BAYER_MATRIX_4X4: number[][] = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16]
];

/**
 * Applies Bayer ordered dithering threshold test.
 */
export function evaluateBayerDither(x: number, y: number, normalizedLuminance: number): boolean {
  const threshold = BAYER_MATRIX_4X4[y % 4][x % 4];
  return normalizedLuminance > threshold;
}

/**
 * Computes snapped pixel block coordinates for procedural pixelation pass.
 */
export function snapToPixelGrid(val: number, blockSize: number): number {
  return Math.floor(val / blockSize) * blockSize;
}

export const PIXELATIONS_DATA = {
  PIXELATION_PROFILES,
  BAYER_MATRIX_4X4,
  evaluateBayerDither,
  snapToPixelGrid,
  DOT_MATRIX: DOT_MATRIX_DATA,
  rasterizeStringToDotMatrix,
  DEFAULT_DOT_MATRIX_CONFIG
};

export * from './Dot_Matrix';

export default PIXELATIONS_DATA;
