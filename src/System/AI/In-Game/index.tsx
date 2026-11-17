/**
 * In-Game AI Core Subsystem
 * Unifies Pseudorandom Functions, Opponents Engine, Drift Guard, Animations,
 * Goat Animal AI, Rider AI, Accessibility Narrations & Places, and Procedural Visuals.
 */

export * from './Category/Pseudorandom_Functions';

export {
  DRIFT_GUARD_CONFIG,
  clampLaneToBounds,
  laneToX,
  xToLane,
  checkLaneConflict,
  findSafestAdjacentLane,
  calculateSteerVelocity,
  applyDriftGuard,
  DRIFT_GUARD_DATA
} from './Drift_Guard';
export type { DriftGuardResult } from './Drift_Guard';

export {
  GAIT_PROFILES,
  getGaitProfile,
  calculateGallopPhases,
  calculateStumbleWobble,
  calculateOpponentAnimationPose,
  calculateStumbleSpeedMultiplier,
  ANIMATIONS_DATA
} from './Animations';
export type { GoatGaitConfig, OpponentAnimationPose } from './Animations';

export {
  GOAT_BREED_KINEMATICS,
  GOAT_TEMPERAMENTS,
  getGoatKinematics,
  getGoatTemperament,
  calculateGoatJumpVelocity,
  evaluateBleatEvent,
  GOAT_DATA
} from './Category/Animal/Goat';
export type { GoatKinematicSpec, GoatTemperamentSpec } from './Category/Animal/Goat';

export * from './Category/Rider';
export * from './Category/Accessibility';
export * from './Category/Visuals/Animations';
export * from './Category';
