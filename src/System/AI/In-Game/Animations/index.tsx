/**
 * Modular registry & State Evaluator for Opponent Animations
 * Coordinates biomechanically calibrated gait, jumping postures, and obstacle recovery.
 */

import {
  GAIT_PROFILES,
  getGaitProfile,
  calculateGallopPhases,
  calculateStumbleWobble
} from './General';

export * from './General';

export interface OpponentAnimationPose {
  leadLegOffset: number;
  trailLegOffset: number;
  headBobOffset: number;
  bankingAngle: number;
  wobbleOffset: number;
  isGrounded: boolean;
}

/**
 * Computes exact animation offsets for drawing or simulating an opponent in the frame loop
 */
export function calculateOpponentAnimationPose(
  opp: {
    size?: string;
    speed: number;
    z: number;
    y: number;
    isJumping?: boolean;
    stumbleTimer?: number;
    targetLane?: number;
    x: number;
  },
  frame: number,
  baseScale: number = 35
): OpponentAnimationPose {
  const profile = getGaitProfile(opp.size);
  const gallop = calculateGallopPhases(frame, opp.speed, opp.size);

  const isGrounded = (opp.y || 0) <= 0.05 && !opp.isJumping;

  // Leg offsets
  let leadLegOffset = 0;
  let trailLegOffset = 0;
  let headBobOffset = 0;

  if (isGrounded) {
    leadLegOffset = Math.sin(gallop.leadPhase) * (baseScale * profile.legSwingAmplitude);
    trailLegOffset = Math.sin(gallop.trailPhase) * (baseScale * profile.legSwingAmplitude);
    headBobOffset = Math.abs(Math.sin(gallop.leadPhase)) * (baseScale * profile.headBobAmplitude);
  } else {
    // Tucked legs during jumping
    leadLegOffset = baseScale * -0.15;
    trailLegOffset = baseScale * -0.15;
    headBobOffset = baseScale * -0.1;
  }

  // Lateral banking based on distance to target lane
  const targetX = (opp.targetLane ?? 0) * 100;
  const steerDelta = targetX - opp.x;
  const bankingAngle = Math.max(-0.25, Math.min(0.25, steerDelta * 0.002));

  // Stumble recovery wobble
  const wobbleOffset = calculateStumbleWobble(opp.stumbleTimer ?? 0);

  return {
    leadLegOffset,
    trailLegOffset,
    headBobOffset: headBobOffset + wobbleOffset * baseScale,
    bankingAngle,
    wobbleOffset,
    isGrounded
  };
}

/**
 * Calculates current recovery multiplier from an active stumble
 */
export function calculateStumbleSpeedMultiplier(stumbleTimer?: number, maxTimer: number = 45): number {
  if (!stumbleTimer || stumbleTimer <= 0) return 1.0;
  // Smooth ease-in from 0.55 back to 1.0 as timer counts down
  const progress = 1.0 - (stumbleTimer / maxTimer);
  return 0.55 + 0.45 * Math.sin(progress * Math.PI * 0.5);
}

// Modular registry for Animations (Preserved for compatibility)
export const ANIMATIONS_DATA = {
  calculateOpponentAnimationPose,
  calculateStumbleSpeedMultiplier,
  calculateGallopPhases,
  getGaitProfile,
  GAIT_PROFILES
};
