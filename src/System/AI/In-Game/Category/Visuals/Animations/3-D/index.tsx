/**
 * Visuals 3-D Animation Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/3-D/index.tsx
 *
 * Implements 3D camera transforms, forward-facing rider POV matrices,
 * rhythmic head/neck bobbing vectors, and 3D vertex projections.
 */

export interface VisualVector3D {
  x: number;
  y: number;
  z: number;
}

export interface Matrix4x4 {
  elements: number[]; // 16-element column-major matrix
}

/**
 * Creates a standard 4x4 identity matrix.
 */
export function createIdentity4x4(): Matrix4x4 {
  return {
    elements: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
  };
}

/**
 * Multiplies two 4x4 matrices.
 */
export function multiply4x4(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
  const ae = a.elements;
  const be = b.elements;
  const te = new Array<number>(16);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      te[j * 4 + i] =
        ae[i] * be[j * 4] +
        ae[4 + i] * be[j * 4 + 1] +
        ae[8 + i] * be[j * 4 + 2] +
        ae[12 + i] * be[j * 4 + 3];
    }
  }

  return { elements: te };
}

/**
 * Generates forward-facing rider POV camera offset vectors based on gait phase.
 * Rhythmic frequency ties directly to goat stride for true equine head-bobbing.
 */
export function calculateRiderPOVHeadBob(
  gaitPhase: number,
  baseEyeHeightM: number = 1.65,
  bobAmplitudeM: number = 0.08,
  nodAngleDeg: number = 2.4
): { eyePosition: VisualVector3D; pitchOffsetDeg: number; yawOffsetDeg: number } {
  // Dual-frequency rhythmic oscillation for natural equine/caprine gait
  const primaryCycle = Math.sin(gaitPhase * Math.PI * 2);
  const secondaryCycle = Math.sin(gaitPhase * Math.PI * 4);
  
  const eyeY = baseEyeHeightM + (primaryCycle * bobAmplitudeM * 0.7) + (secondaryCycle * bobAmplitudeM * 0.3);
  const pitchOffsetDeg = primaryCycle * nodAngleDeg;
  const yawOffsetDeg = Math.cos(gaitPhase * Math.PI * 2) * (nodAngleDeg * 0.4);

  return {
    eyePosition: { x: 0, y: eyeY, z: 0 },
    pitchOffsetDeg,
    yawOffsetDeg
  };
}

/**
 * Projects a 3D world space coordinate into 2D camera viewport space.
 */
export function project3DToScreen(
  worldPos: VisualVector3D,
  cameraPos: VisualVector3D,
  fovDeg: number,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number; depth: number; visible: boolean } {
  const relX = worldPos.x - cameraPos.x;
  const relY = worldPos.y - cameraPos.y;
  const relZ = worldPos.z - cameraPos.z;

  if (relZ <= 0.1) {
    return { x: 0, y: 0, depth: relZ, visible: false };
  }

  const fovRad = (fovDeg * Math.PI) / 180.0;
  const f = (viewportHeight * 0.5) / Math.tan(fovRad * 0.5);

  const screenX = (viewportWidth * 0.5) + (relX / relZ) * f;
  const screenY = (viewportHeight * 0.5) - (relY / relZ) * f;

  return {
    x: screenX,
    y: screenY,
    depth: relZ,
    visible: screenX >= -200 && screenX <= viewportWidth + 200 && screenY >= -200 && screenY <= viewportHeight + 200
  };
}

export const THREE_D_DATA = {
  createIdentity4x4,
  multiply4x4,
  calculateRiderPOVHeadBob,
  project3DToScreen
};

export default THREE_D_DATA;
