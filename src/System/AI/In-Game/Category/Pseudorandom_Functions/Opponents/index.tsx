/**
 * Opponents Pseudorandom Decision Engine
 * Computes arcade opponent decisions per frame using deterministic PRNG,
 * calibrated rubber banding, obstacle sensing, overtaking maneuvers, and Drift Guard.
 */

import { generateOpponentTraits, calculateRubberBandSpeed } from './General';
import { pseudoRandomRange, pseudoRandomInt } from '../General';
import { applyDriftGuard, clampLaneToBounds } from '../../../Drift_Guard';
import { calculateGoatJumpVelocity, evaluateBleatEvent } from '../../Animal/Goat';
import { calculateStumbleSpeedMultiplier } from '../../../Animations';

export interface OpponentDecision {
  targetLane: number;
  shouldJump: boolean;
  computedSpeed: number;
  jumpVy?: number;
  isDrafting?: boolean;
  shouldBleat?: boolean;
  isOvertaking?: boolean;
  driftGuarded?: boolean;
}

export interface OpponentDecisionOptions {
  playerX?: number;
  otherOpponents?: Array<{
    id: string;
    x: number;
    y?: number;
    z: number;
    speed?: number;
    isJumping?: boolean;
    style?: string;
    size?: string;
    targetLane?: number;
  }>;
  stumbleTimer?: number;
  currentSpeed?: number;
  size?: string;
  style?: string;
}

export function computeOpponentDecision(
  opponentId: string,
  opponentX: number,
  opponentZ: number,
  playerZ: number,
  baseSpeed: number,
  level: number,
  upcomingObstacles: Array<{ x: number; z: number; width?: number; cleared?: boolean }>,
  options?: OpponentDecisionOptions
): OpponentDecision {
  const seed = Math.floor(opponentZ * 10) + level;
  const traits = generateOpponentTraits(opponentId, level);

  // 1. Calculate rubber-banded speed
  let computedSpeed = calculateRubberBandSpeed(playerZ, opponentZ, baseSpeed, level, seed);

  // Apply stumble recovery penalty if recovering from collision
  if (options?.stumbleTimer && options.stumbleTimer > 0) {
    const recoveryMultiplier = calculateStumbleSpeedMultiplier(options.stumbleTimer);
    computedSpeed *= recoveryMultiplier;
  }

  let shouldJump = false;
  let jumpVy: number | undefined = undefined;
  let isDrafting = false;
  let isOvertaking = false;
  let shouldBleat = false;
  let targetLane = Math.max(-4, Math.min(3, Math.round(opponentX / 100)));

  // 2. Obstacle Sensing & Avoidance Window
  const lookaheadDist = (traits.style === 'cautious' ? 360 : traits.style === 'steady' ? 280 : 200) + Math.min(50, level * 2);

  const nearestObstacle = upcomingObstacles.find(
    obs => !obs.cleared && obs.z > opponentZ && obs.z < opponentZ + lookaheadDist
  );

  let obstacleAvoiding = false;

  if (nearestObstacle) {
    const obstacleLane = Math.round(nearestObstacle.x / 100);
    const distanceToObs = nearestObstacle.z - opponentZ;
    const obstacleWidth = nearestObstacle.width || 1;
    const isDirectCollisionCourse = Math.abs(targetLane - obstacleLane) < (obstacleWidth / 2 + 0.45);

    if (isDirectCollisionCourse) {
      obstacleAvoiding = true;

      // Check if jumping or swerving is preferred
      const prefersJump = traits.aggression > 0.5 || obstacleWidth > 2.0;

      if (prefersJump) {
        // Vault launch window: calibrated to speed so goat arcs over the hurdle cleanly
        const launchMax = Math.max(120, computedSpeed * 45);
        const launchMin = Math.max(30, computedSpeed * 10);

        if (distanceToObs <= launchMax && distanceToObs >= launchMin) {
          shouldJump = true;
          jumpVy = calculateGoatJumpVelocity(options?.size, traits.style);
        }
      } else {
        // Cautious / Steady evasion: early lane steer
        if (distanceToObs < 300) {
          const side = pseudoRandomInt(seed, 0, 1) === 0 ? -1 : 1;
          const candidateLane = clampLaneToBounds(targetLane + side);

          // Check if candidate lane is clear of the obstacle
          if (Math.abs(candidateLane - obstacleLane) >= (obstacleWidth / 2 + 0.45)) {
            targetLane = candidateLane;
          } else {
            // Both lanes obstructed: emergency jump!
            if (distanceToObs < 160) {
              shouldJump = true;
              jumpVy = calculateGoatJumpVelocity(options?.size, traits.style);
            }
          }
        }
      }
    }
  }

  // 3. Pack Dynamics, Drafting & Overtaking (when not dodging obstacle)
  if (!obstacleAvoiding) {
    const otherRunners = options?.otherOpponents ?? [];
    const playerX = options?.playerX ?? 0;

    // Check for competitors directly in front within drafting / passing distance
    const frontRunner = otherRunners.find(
      r => r.id !== opponentId && r.z > opponentZ && (r.z - opponentZ) < 140 && Math.abs(r.x - opponentX) < 60
    );

    const isPlayerInFront = (playerZ > opponentZ) && ((playerZ - opponentZ) < 140) && Math.abs(playerX - opponentX) < 60;

    if (frontRunner || isPlayerInFront) {
      const leaderZ = frontRunner ? frontRunner.z : playerZ;
      const gap = leaderZ - opponentZ;

      if (gap > 40 && gap < 130) {
        // Slipstreaming draft boost!
        isDrafting = true;
        computedSpeed += 0.22;

        // Pull out and pass (overtaking maneuver)
        if (traits.aggression > 0.45 && gap < 100) {
          isOvertaking = true;
          const passSide = (targetLane > 0) ? -1 : 1;
          targetLane = clampLaneToBounds(targetLane + passSide);
        }
      }
    } else {
      // Natural arcade lane wandering (infrequent, rhythmically spaced)
      const wanderCycle = Math.floor(opponentZ / 400);
      const wanderHash = (wanderCycle * 2147483647) ^ seed;
      const wanderRoll = pseudoRandomRange(wanderHash, 0, 1);

      if (wanderRoll < 0.18) {
        // Drift toward preferred racing line
        const step = traits.lanePreference > targetLane ? 1 : traits.lanePreference < targetLane ? -1 : 0;
        if (step !== 0) {
          targetLane = clampLaneToBounds(targetLane + step);
        }
      }
    }
  }

  // 4. Drift Guard Resolution (ensures lane boundaries and anti-crowding)
  const guard = applyDriftGuard(
    opponentId,
    opponentX,
    opponentZ,
    targetLane,
    options?.otherOpponents ?? [],
    options?.playerX !== undefined ? { x: options.playerX, z: playerZ } : undefined
  );

  targetLane = guard.adjustedTargetLane;
  if (guard.isDrafting) {
    isDrafting = true;
    computedSpeed += 0.15;
  }

  // 5. Situational Vocalization (Bleats)
  const distToPlayer = opponentZ - playerZ;
  if (Math.abs(distToPlayer) < 30 && computedSpeed > baseSpeed) {
    // Overtaking the player taunt
    shouldBleat = evaluateBleatEvent('overtake', traits.style, pseudoRandomRange(seed + 99, 0, 1));
  } else if (nearestObstacle && nearestObstacle.cleared && Math.abs(nearestObstacle.z - opponentZ) < 30) {
    // Jump clearance triumph
    shouldBleat = evaluateBleatEvent('vault', traits.style, pseudoRandomRange(seed + 55, 0, 1));
  }

  return {
    targetLane,
    shouldJump,
    computedSpeed,
    jumpVy: jumpVy ?? (options?.size === 'small' ? 0.44 : options?.size === 'largest' ? 0.62 : 0.52),
    isDrafting,
    shouldBleat,
    isOvertaking,
    driftGuarded: guard.isGuarded
  };
}
