/**
 * Modular registry & Decision System for Drift_Guard
 * Calibrates lane discipline, resolves pack crowding, and guarantees safety constraints.
 */

import {
  DRIFT_GUARD_CONFIG,
  clampLaneToBounds,
  laneToX,
  xToLane,
  checkLaneConflict,
  findSafestAdjacentLane,
  calculateSteerVelocity
} from './General';

export * from './General';

export interface DriftGuardResult {
  adjustedTargetLane: number;
  steerVelocity: number;
  isGuarded: boolean;
  boundaryClamped: boolean;
  crowdingResolved: boolean;
  isDrafting: boolean;
  draftTargetId?: string;
}

/**
 * Evaluates requested movement against lane boundaries and nearby competitors.
 * Ensures opponents do not wander outside lanes, clip through one another,
 * or twitch rapidly across lanes.
 */
export function applyDriftGuard(
  opponentId: string,
  currentX: number,
  opponentZ: number,
  requestedLane: number,
  allRunners: Array<{ id: string; x: number; z: number }>,
  player?: { x: number; z: number }
): DriftGuardResult {
  let adjustedLane = requestedLane;
  let boundaryClamped = false;
  let crowdingResolved = false;
  let isDrafting = false;
  let draftTargetId: string | undefined = undefined;

  // 1. Boundary clamping
  const strictlyClamped = clampLaneToBounds(requestedLane);
  if (strictlyClamped !== requestedLane) {
    boundaryClamped = true;
    adjustedLane = strictlyClamped;
  }

  // 2. Aggregate competitors (other AI opponents + player)
  const competitors: Array<{ id: string; x: number; z: number }> = allRunners.filter(
    r => r.id !== opponentId
  );
  if (player) {
    competitors.push({ id: 'player', x: player.x, z: player.z });
  }

  // 3. Check for conflict in target lane
  const conflict = checkLaneConflict(
    adjustedLane,
    opponentZ,
    competitors,
    opponentId,
    DRIFT_GUARD_CONFIG.MIN_Z_SEPARATION
  );

  if (conflict.isConflict && conflict.deltaZ !== undefined) {
    // If the competitor in front is within drafting distance (ahead by 35 to 140 feet),
    // goat may slipstream behind instead of panicking!
    if (
      conflict.deltaZ > DRIFT_GUARD_CONFIG.DRAFT_Z_WINDOW_MIN &&
      conflict.deltaZ < DRIFT_GUARD_CONFIG.DRAFT_Z_WINDOW_MAX
    ) {
      isDrafting = true;
      draftTargetId = conflict.conflictingRunnerId;
    } else {
      // Overlapping or too close: find alternative lane to resolve crowding
      const occupiedLanes = new Set<number>();
      for (const comp of competitors) {
        if (Math.abs(comp.z - opponentZ) < DRIFT_GUARD_CONFIG.MIN_Z_SEPARATION) {
          occupiedLanes.add(xToLane(comp.x));
        }
      }
      occupiedLanes.add(adjustedLane);

      const alternativeLane = findSafestAdjacentLane(adjustedLane, occupiedLanes);
      if (alternativeLane !== adjustedLane) {
        adjustedLane = alternativeLane;
        crowdingResolved = true;
      }
    }
  }

  // 4. Calculate smooth steering toward adjusted lane
  const steerVelocity = calculateSteerVelocity(currentX, adjustedLane);

  return {
    adjustedTargetLane: adjustedLane,
    steerVelocity,
    isGuarded: boundaryClamped || crowdingResolved,
    boundaryClamped,
    crowdingResolved,
    isDrafting,
    draftTargetId
  };
}

// Modular registry for Drift_Guard (Preserved for compatibility)
export const DRIFT_GUARD_DATA = {
  applyDriftGuard,
  clampLaneToBounds,
  laneToX,
  xToLane,
  calculateSteerVelocity,
  config: DRIFT_GUARD_CONFIG
};
