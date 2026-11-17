/**
 * Dot-Matrix Display & Phosphor Emulation Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Pixelations/Dot_Matrix/index.tsx
 *
 * Implements retro dot-matrix billboard signage, LED pitch spacing,
 * phosphor persistence decay, and procedural pixel grid text rasterization.
 */

export interface DotMatrixConfig {
  columns: number;
  rows: number;
  dotPitchPx: number;
  dotRadiusPx: number;
  activeColor: string;
  glowColor: string;
  inactiveAlpha: number;
}

export const DEFAULT_DOT_MATRIX_CONFIG: DotMatrixConfig = {
  columns: 32,
  rows: 8,
  dotPitchPx: 6,
  dotRadiusPx: 2.2,
  activeColor: '#FFB300',
  glowColor: 'rgba(255, 179, 0, 0.35)',
  inactiveAlpha: 0.12
};

/**
 * 5x7 Dot-matrix character bitmasks for procedural retro signage
 */
export const DOT_MATRIX_FONT: Record<string, number[]> = {
  '0': [0x1F, 0x11, 0x11, 0x11, 0x1F],
  '1': [0x00, 0x12, 0x1F, 0x10, 0x00],
  '2': [0x19, 0x15, 0x15, 0x15, 0x12],
  '3': [0x11, 0x15, 0x15, 0x15, 0x1F],
  '4': [0x07, 0x04, 0x04, 0x1F, 0x04],
  '5': [0x17, 0x15, 0x15, 0x15, 0x09],
  '6': [0x1F, 0x15, 0x15, 0x15, 0x09],
  '7': [0x01, 0x01, 0x19, 0x05, 0x03],
  '8': [0x1F, 0x15, 0x15, 0x15, 0x1F],
  '9': [0x07, 0x05, 0x05, 0x05, 0x1F],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
  'G': [0x1F, 0x11, 0x15, 0x15, 0x1D],
  'O': [0x1F, 0x11, 0x11, 0x11, 0x1F],
  'A': [0x1E, 0x05, 0x05, 0x05, 0x1E],
  'T': [0x01, 0x01, 0x1F, 0x01, 0x01]
};

/**
 * Procedurally rasterizes a string into a 2D boolean grid for dot-matrix rendering.
 */
export function rasterizeStringToDotMatrix(text: string, columns: number = 32, rows: number = 8): boolean[][] {
  const grid: boolean[][] = Array.from({ length: rows }, () => Array(columns).fill(false));
  const upper = text.toUpperCase();
  let cursorCol = 1;

  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    const glyph = DOT_MATRIX_FONT[char] || DOT_MATRIX_FONT[' '];
    if (cursorCol + 5 >= columns) break;

    for (let c = 0; c < glyph.length; c++) {
      const colByte = glyph[c];
      for (let r = 0; r < 7; r++) {
        if ((colByte & (1 << r)) !== 0 && r + 1 < rows && cursorCol + c < columns) {
          grid[r + 1][cursorCol + c] = true;
        }
      }
    }
    cursorCol += 6; // glyph width 5 + 1 spacing
  }

  return grid;
}

export const DOT_MATRIX_DATA = {
  DEFAULT_DOT_MATRIX_CONFIG,
  DOT_MATRIX_FONT,
  rasterizeStringToDotMatrix
};

export default DOT_MATRIX_DATA;
