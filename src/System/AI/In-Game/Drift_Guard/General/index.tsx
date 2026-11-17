/**
 * Drift Guard General Calculations & Lane Boundary Safety
 * Enforces the 8 distinct lanes (-4 to +3) with spatial bounds, anti-crowding buffers,
 * and lateral transition smoothing.
 */

export const DRIFT_GUARD_CONFIG = {
  MIN_LANE: -4,
  MAX_LANE: 3,
  TOTAL_LANES: 8,
  LANE_WIDTH: 100,
  MIN_Z_SEPARATION: 75,
  DRAFT_Z_WINDOW_MIN: 35,
  DRAFT_Z_WINDOW_MAX: 140,
  STEER_SMOOTH_FACTOR: 0.12,
  MAX_STEER_IMPULSE: 18.0
} as const;

/**
 * Strictly clamps an arbitrary lane number to the 8-lane corridor [-4, 3]
 */
export function clampLaneToBounds(lane: number): number {
  return Math.max(DRIFT_GUARD_CONFIG.MIN_LANE, Math.min(DRIFT_GUARD_CONFIG.MAX_LANE, Math.round(lane)));
}

/**
 * Converts discrete lane coordinate to world X
 */
export function laneToX(lane: number): number {
  return clampLaneToBounds(lane) * DRIFT_GUARD_CONFIG.LANE_WIDTH;
}

/**
 * Converts continuous world X to closest discrete lane index [-4, 3]
 */
export function xToLane(x: number): number {
  return clampLaneToBounds(Math.round(x / DRIFT_GUARD_CONFIG.LANE_WIDTH));
}

/**
 * Detects whether another runner occupies the target lane in close longitudinal proximity
 */
export function checkLaneConflict(
  targetLane: number,
  opponentZ: number,
  otherRunners: Array<{ id: string; x: number; z: number }>,
  selfId: string,
  zThreshold: number = DRIFT_GUARD_CONFIG.MIN_Z_SEPARATION
): { isConflict: boolean; conflictingRunnerId?: string; deltaZ?: number } {
  for (const runner of otherRunners) {
    if (runner.id === selfId) continue;
    const runnerLane = xToLane(runner.x);
    if (runnerLane === targetLane) {
      const dz = runner.z - opponentZ;
      if (Math.abs(dz) < zThreshold) {
        return { isConflict: true, conflictingRunnerId: runner.id, deltaZ: dz };
      }
    }
  }
  return { isConflict: false };
}

/**
 * Discovers the safest unoccupied adjacent lane if current or target lane is contested
 */
export function findSafestAdjacentLane(
  currentLane: number,
  occupiedLanes: Set<number> | number[]
): number {
  const occupiedSet = occupiedLanes instanceof Set ? occupiedLanes : new Set(occupiedLanes);
  const clamped = clampLaneToBounds(currentLane);

  // Preferred alternate candidates: left, right, then further outwards
  const candidates = [clamped - 1, clamped + 1, clamped - 2, clamped + 2];

  for (const candidate of candidates) {
    if (
      candidate >= DRIFT_GUARD_CONFIG.MIN_LANE &&
      candidate <= DRIFT_GUARD_CONFIG.MAX_LANE &&
      !occupiedSet.has(candidate)
    ) {
      return candidate;
    }
  }

  // Fallback: stay in clamped lane if all alternatives are crowded
  return clamped;
}

/**
 * Calculates smooth lateral steering velocity toward target lane without jerky snapping
 */
export function calculateSteerVelocity(
  currentX: number,
  targetLane: number,
  responsiveness: number = DRIFT_GUARD_CONFIG.STEER_SMOOTH_FACTOR
): number {
  const targetX = laneToX(targetLane);
  const diff = targetX - currentX;
  const steer = diff * responsiveness;
  return Math.max(
    -DRIFT_GUARD_CONFIG.MAX_STEER_IMPULSE,
    Math.min(DRIFT_GUARD_CONFIG.MAX_STEER_IMPULSE, steer)
  );
}

// Modular registry for General (Preserved for compatibility)
export const GENERAL_DATA = {
  config: DRIFT_GUARD_CONFIG,
  clampLaneToBounds,
  laneToX,
  xToLane,
  checkLaneConflict,
  findSafestAdjacentLane,
  calculateSteerVelocity
};
