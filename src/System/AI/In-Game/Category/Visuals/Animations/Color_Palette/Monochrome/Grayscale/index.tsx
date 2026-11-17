/**
 * Visuals Grayscale Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Color_Palette/Monochrome/Grayscale/index.tsx
 *
 * Implements scientific color-to-grayscale transformation matrices using
 * standard ITU-R BT.709 and BT.601 luminance algorithms with quantization steps.
 */

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Calculates ITU-R BT.709 standard relative luminance (photopic vision).
 */
export function calculateLuminanceBT709(color: RGBColor): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

/**
 * Calculates ITU-R BT.601 standard relative luminance (legacy NTSC/PAL CRT).
 */
export function calculateLuminanceBT601(color: RGBColor): number {
  return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
}

/**
 * Quantizes luminance into discrete steps (e.g., 4 shades for GameBoy, 16 shades for retro CRT).
 */
export function quantizeLuminance(luminance: number, steps: number = 16): number {
  const stepSize = 255 / (steps - 1);
  return Math.round(luminance / stepSize) * stepSize;
}

/**
 * Converts hex color string into quantized grayscale hex string.
 */
export function hexToGrayscale(hex: string, steps: number = 256): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#808080';
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  const lum = calculateLuminanceBT709({ r, g, b });
  const qLum = Math.round(quantizeLuminance(lum, steps));
  const hexVal = qLum.toString(16).padStart(2, '0');
  return `#${hexVal}${hexVal}${hexVal}`;
}

export const GRAYSCALE_DATA = {
  calculateLuminanceBT709,
  calculateLuminanceBT601,
  quantizeLuminance,
  hexToGrayscale
};

export default GRAYSCALE_DATA;
