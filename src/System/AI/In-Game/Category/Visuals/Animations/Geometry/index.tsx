/**
 * Visuals Geometry Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Geometry/index.tsx
 *
 * Implements parametric 3D track curvature math, sine-base road offsets,
 * banked curve elevation angles, and obstacle collision bounding cylinders.
 */

export interface TrackPointGeometry {
  worldZ: number;
  curveOffsetX: number;
  bankingAngleRad: number;
  hillOffsetY: number;
  laneCentersX: number[]; // 8 distinct lane positions
}

export interface BoundingCylinder {
  centerX: number;
  centerY: number;
  centerZ: number;
  radius: number;
  height: number;
}

/**
 * Calculates continuous sine-based horizontal road curvature for 400-level progression.
 */
export function calculateTrackCurvatureAtZ(z: number, level: number = 1): number {
  const primaryFrequency = 0.002 + Math.min(0.006, level * 0.000015);
  const secondaryFrequency = 0.0005 + (level % 17) * 0.00002;
  const amplitude = 18.0 + Math.min(42.0, level * 0.12);

  const primary = Math.sin(z * primaryFrequency) * amplitude;
  const secondary = Math.cos(z * secondaryFrequency) * (amplitude * 0.4);
  return primary + secondary;
}

/**
 * Calculates road banking angle (tilt) to match lateral centrifugal forces.
 */
export function calculateRoadBankingAngle(z: number, level: number, speedMps: number = 18.0): number {
  const curvatureDerivative =
    (calculateTrackCurvatureAtZ(z + 1.0, level) - calculateTrackCurvatureAtZ(z - 1.0, level)) * 0.5;
  // Centripetal tilt compensation
  const maxBankingRad = 0.26; // ~15 degrees
  const rawBanking = (curvatureDerivative * (speedMps * 0.015));
  return Math.max(-maxBankingRad, Math.min(maxBankingRad, rawBanking));
}

/**
 * Generates the 8 distinct lane center coordinates for a cross-section of track.
 */
export function calculateLaneCenters(centerRoadX: number, laneWidthMeters: number = 2.4): number[] {
  // 8 distinct lanes indexed -4 to +3
  const lanes: number[] = [];
  for (let laneIdx = -4; laneIdx <= 3; laneIdx++) {
    // lane -4 has center at -3.5 * laneWidth, lane 0 has center at +0.5 * laneWidth, etc.
    const laneOffset = (laneIdx + 0.5) * laneWidthMeters;
    lanes.push(centerRoadX + laneOffset);
  }
  return lanes;
}

/**
 * Performs accurate 3D cylinder collision check for player vs obstacle.
 */
export function checkCylinderCollision(
  objA: BoundingCylinder,
  objB: BoundingCylinder
): boolean {
  const dx = objA.centerX - objB.centerX;
  const dz = objA.centerZ - objB.centerZ;
  const distSq = dx * dx + dz * dz;
  const radiusSum = objA.radius + objB.radius;

  if (distSq > radiusSum * radiusSum) {
    return false;
  }

  // Vertical overlap test
  const aTop = objA.centerY + objA.height;
  const bTop = objB.centerY + objB.height;
  return !(objA.centerY > bTop || aTop < objB.centerY);
}

export const GEOMETRY_DATA = {
  calculateTrackCurvatureAtZ,
  calculateRoadBankingAngle,
  calculateLaneCenters,
  checkCylinderCollision
};

export default GEOMETRY_DATA;
