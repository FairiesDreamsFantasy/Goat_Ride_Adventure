/**
 * Visuals 2-D Animation Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/2-D/index.tsx
 *
 * Implements 2D orthographic transformation matrices, sprite scaling,
 * billboard tilt angles, and dynamic screen-space parallax calculations.
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Transform2DMatrix {
  a: number; // horizontal scale
  b: number; // horizontal skew
  c: number; // vertical skew
  d: number; // vertical scale
  tx: number; // horizontal translation
  ty: number; // vertical translation
}

export interface SpriteFrame2D {
  frameIndex: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  scale: number;
  rotationRad: number;
}

/**
 * Creates identity 2D affine transformation matrix.
 */
export function createIdentity2D(): Transform2DMatrix {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

/**
 * Multiplies two 2D affine transformation matrices.
 */
export function multiply2D(m1: Transform2DMatrix, m2: Transform2DMatrix): Transform2DMatrix {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx,
    ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty
  };
}

/**
 * Computes 2D billboard sprite oscillation based on gallop gait frequency.
 */
export function calculate2DBillboardOscillation(
  gaitPhase: number,
  verticalAmplitudePx: number = 6.0,
  rollAmplitudeRad: number = 0.045
): { offsetY: number; rotationRad: number; squishScaleY: number } {
  const offsetY = Math.sin(gaitPhase * Math.PI * 2) * verticalAmplitudePx;
  const rotationRad = Math.sin(gaitPhase * Math.PI) * rollAmplitudeRad;
  const squishScaleY = 1.0 - Math.abs(Math.sin(gaitPhase * Math.PI * 2)) * 0.05;
  return { offsetY, rotationRad, squishScaleY };
}

/**
 * Calculates orthographic screen coordinate from normalized game coordinates.
 */
export function project2DOrthographic(
  normX: number,
  normY: number,
  viewportWidth: number,
  viewportHeight: number
): Vector2D {
  return {
    x: (normX + 1.0) * 0.5 * viewportWidth,
    y: (1.0 - (normY + 1.0) * 0.5) * viewportHeight
  };
}

export const TWO_D_DATA = {
  createIdentity2D,
  multiply2D,
  calculate2DBillboardOscillation,
  project2DOrthographic
};

export default TWO_D_DATA;
