/**
 * Opponents General Pseudorandom Utility Functions
 * Scientific calculations for arcade opponent AI behavior, rubber-banding, and movement smoothing.
 */

import { mulberry32, pseudoRandomRange, pseudoGaussian } from '../../General';

export interface OpponentAITrait {
  aggression: number;       // 0.0 to 1.0
  lanePreference: number;   // -4 to 3
  reactionJitter: number;   // ms / frame offset
  maxSpeedVariance: number;
  cruisingSpeed?: number;   // autonomous base speed
  draftingSkill?: number;   // propensity to draft and sling around
  preferredGap?: number;    // preferred racing distance behind leader
  style?: 'cautious' | 'steady' | 'aggressive';
}

// Known opponent personality profiles for the 7 canonical racers
const KNOWN_OPPONENT_PROFILES: Record<string, Partial<OpponentAITrait>> = {
  opp_pip: {
    aggression: 0.25,
    lanePreference: -3,
    reactionJitter: 5,
    maxSpeedVariance: 0.15,
    cruisingSpeed: 2.05,
    draftingSkill: 0.40,
    preferredGap: 180,
    style: 'cautious'
  },
  opp_gideon: {
    aggression: 0.30,
    lanePreference: -2,
    reactionJitter: 6,
    maxSpeedVariance: 0.18,
    cruisingSpeed: 2.10,
    draftingSkill: 0.45,
    preferredGap: 160,
    style: 'cautious'
  },
  opp_clover: {
    aggression: 0.85,
    lanePreference: -1,
    reactionJitter: 2,
    maxSpeedVariance: 0.35,
    cruisingSpeed: 2.30,
    draftingSkill: 0.85,
    preferredGap: 80,
    style: 'aggressive'
  },
  opp_abigay_jr: {
    aggression: 0.50,
    lanePreference: 0,
    reactionJitter: 4,
    maxSpeedVariance: 0.22,
    cruisingSpeed: 2.18,
    draftingSkill: 0.65,
    preferredGap: 120,
    style: 'steady'
  },
  opp_luna_bear: {
    aggression: 0.55,
    lanePreference: 1,
    reactionJitter: 4,
    maxSpeedVariance: 0.24,
    cruisingSpeed: 2.16,
    draftingSkill: 0.60,
    preferredGap: 130,
    style: 'steady'
  },
  opp_buster: {
    aggression: 0.90,
    lanePreference: 2,
    reactionJitter: 1,
    maxSpeedVariance: 0.38,
    cruisingSpeed: 2.35,
    draftingSkill: 0.90,
    preferredGap: 70,
    style: 'aggressive'
  },
  opp_barnaby: {
    aggression: 0.80,
    lanePreference: 3,
    reactionJitter: 3,
    maxSpeedVariance: 0.30,
    cruisingSpeed: 2.25,
    draftingSkill: 0.75,
    preferredGap: 90,
    style: 'aggressive'
  }
};

/**
 * Generate deterministic trait profile for an opponent based on ID and Level
 */
export function generateOpponentTraits(opponentId: string, level: number): OpponentAITrait {
  const known = KNOWN_OPPONENT_PROFILES[opponentId];

  let hash = 0;
  for (let i = 0; i < opponentId.length; i++) {
    hash = (hash << 5) - hash + opponentId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash ^ (level * 99991));
  const prng = mulberry32(seed);

  const baseAggression = known?.aggression ?? Math.min(1.0, Math.max(0.1, prng() * 0.8));
  const levelAggressionBonus = Math.min(0.15, level * 0.001);

  return {
    aggression: Math.min(1.0, baseAggression + levelAggressionBonus),
    lanePreference: known?.lanePreference ?? (Math.floor(prng() * 8) - 4),
    reactionJitter: known?.reactionJitter ?? Math.floor(pseudoGaussian(seed + 1, 0, 8)),
    maxSpeedVariance: known?.maxSpeedVariance ?? pseudoRandomRange(seed + 2, -0.15, 0.35),
    cruisingSpeed: known?.cruisingSpeed ?? (1.9 + prng() * 0.4),
    draftingSkill: known?.draftingSkill ?? (0.3 + prng() * 0.5),
    preferredGap: known?.preferredGap ?? (90 + prng() * 100),
    style: known?.style ?? (baseAggression > 0.7 ? 'aggressive' : baseAggression > 0.4 ? 'steady' : 'cautious')
  };
}

/**
 * Calibrated rubber-band velocity modifier to keep arcade opponents competitive and thrilling.
 * Keeps opponents within the visible, audible, accessible race corridor.
 */
export function calculateRubberBandSpeed(
  playerZ: number,
  opponentZ: number,
  baseSpeed: number,
  level: number,
  seed: number
): number {
  const deltaZ = playerZ - opponentZ; // positive if player is ahead, negative if opponent is ahead

  // Guaranteed autonomous cruising speed baseline so opponents don't freeze
  const activeBaseSpeed = Math.max(1.85, baseSpeed > 0 ? baseSpeed : 2.1);

  // Stride surge micro-oscillation for lifelike racing pace
  const strideSurge = Math.sin((seed + opponentZ * 0.08)) * 0.06;

  let rubberBandMultiplier = 1.0;

  if (deltaZ > 0) {
    // Player is ahead (opponent is trailing)
    if (deltaZ < 200) {
      // Close chase: exciting pursuit
      rubberBandMultiplier = 1.04 + (deltaZ / 200) * 0.08;
    } else if (deltaZ < 600) {
      // Moderate gap: progressive catch-up
      rubberBandMultiplier = 1.12 + ((deltaZ - 200) / 400) * 0.20;
    } else {
      // Far behind: strong rubber band recovery to stay in the contest
      rubberBandMultiplier = Math.min(1.48, 1.32 + (deltaZ - 600) * 0.0004);
    }
  } else {
    // Opponent is ahead of player (leading)
    const leadDistance = Math.abs(deltaZ);
    if (leadDistance < 250) {
      // Close lead: exciting battle for first place
      rubberBandMultiplier = 1.02 - (leadDistance / 250) * 0.04;
    } else if (leadDistance < 550) {
      // Moderate lead: pace settling so player has a realistic chance to overtake
      rubberBandMultiplier = 0.96 - ((leadDistance - 250) / 300) * 0.12;
    } else {
      // Far ahead: throttle relaxation prevents them disappearing over the horizon
      rubberBandMultiplier = Math.max(0.72, 0.84 - ((leadDistance - 550) * 0.0003));
    }
  }

  // Level difficulty adjustment (calibrated: subtle increase with levels, capped)
  const levelMult = 1.0 + Math.min(0.35, level * 0.0025);

  const finalSpeed = (activeBaseSpeed * rubberBandMultiplier * levelMult) + strideSurge;

  // Safe clamping to maintain high playability
  return Math.max(1.1, Math.min(4.5, finalSpeed));
}
