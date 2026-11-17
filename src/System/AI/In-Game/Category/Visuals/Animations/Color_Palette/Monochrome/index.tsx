/**
 * Visuals Monochrome Color Palette Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Color_Palette/Monochrome/index.tsx
 *
 * Implements monochrome accessibility profiles, phosphor tint models
 * (P1 Green, Amber CRT, Cyan Glow), and re-exports the Grayscale calculation engine.
 */

import { GRAYSCALE_DATA, calculateLuminanceBT709, hexToGrayscale, RGBColor } from './Grayscale';

export interface MonochromePhosphorProfile {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  glowColor: string;
  tintMultiplier: [number, number, number]; // R, G, B weights
}

export const MONOCHROME_PROFILES: Record<string, MonochromePhosphorProfile> = {
  p1_green_phosphor: {
    id: 'p1_green_phosphor',
    name: 'P1 Classic Green Phosphor (525nm)',
    primaryColor: '#33FF33',
    secondaryColor: '#1A801A',
    backgroundColor: '#051405',
    glowColor: 'rgba(51, 255, 51, 0.4)',
    tintMultiplier: [0.15, 1.0, 0.15]
  },
  amber_crt: {
    id: 'amber_crt',
    name: 'P3 Amber Warm CRT (600nm)',
    primaryColor: '#FFB000',
    secondaryColor: '#996A00',
    backgroundColor: '#1A1200',
    glowColor: 'rgba(255, 176, 0, 0.4)',
    tintMultiplier: [1.0, 0.69, 0.0]
  },
  high_contrast_bw: {
    id: 'high_contrast_bw',
    name: 'High-Contrast Accessibility Black & White',
    primaryColor: '#FFFFFF',
    secondaryColor: '#A0A0A0',
    backgroundColor: '#000000',
    glowColor: 'rgba(255, 255, 255, 0.5)',
    tintMultiplier: [1.0, 1.0, 1.0]
  },
  paper_white: {
    id: 'paper_white',
    name: 'E-Ink Paper White Monochrome',
    primaryColor: '#111111',
    secondaryColor: '#555555',
    backgroundColor: '#F5F5F0',
    glowColor: 'rgba(0, 0, 0, 0.05)',
    tintMultiplier: [0.95, 0.95, 0.90]
  }
};

/**
 * Applies monochrome phosphor profile to an RGB color based on its luminance.
 */
export function applyMonochromeProfile(
  color: RGBColor,
  profile: MonochromePhosphorProfile = MONOCHROME_PROFILES.p1_green_phosphor
): RGBColor {
  const lum = calculateLuminanceBT709(color) / 255.0;
  return {
    r: Math.round(lum * 255 * profile.tintMultiplier[0]),
    g: Math.round(lum * 255 * profile.tintMultiplier[1]),
    b: Math.round(lum * 255 * profile.tintMultiplier[2])
  };
}

export const MONOCHROME_DATA = {
  MONOCHROME_PROFILES,
  applyMonochromeProfile,
  GRAYSCALE: GRAYSCALE_DATA,
  calculateLuminanceBT709,
  hexToGrayscale
};

export * from './Grayscale';

export default MONOCHROME_DATA;
