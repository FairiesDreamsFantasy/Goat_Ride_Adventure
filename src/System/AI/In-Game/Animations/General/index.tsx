/**
 * Animations General Biomechanical & Kinematic Models
 * Scientific gait oscillation, equine-inspired dual-thump timing, and stumble recovery dynamics.
 */

export interface GoatGaitConfig {
  strideFrequency: number;
  dualThumpOffset: number;
  legSwingAmplitude: number;
  headBobAmplitude: number;
  hornSwayMultiplier: number;
}

export const GAIT_PROFILES: Record<string, GoatGaitConfig> = {
  small: {
    strideFrequency: 0.30,
    dualThumpOffset: 0.28,
    legSwingAmplitude: 0.18,
    headBobAmplitude: 0.12,
    hornSwayMultiplier: 1.2
  },
  standard: {
    strideFrequency: 0.22,
    dualThumpOffset: 0.32,
    legSwingAmplitude: 0.20,
    headBobAmplitude: 0.15,
    hornSwayMultiplier: 1.0
  },
  large: {
    strideFrequency: 0.20,
    dualThumpOffset: 0.34,
    legSwingAmplitude: 0.22,
    headBobAmplitude: 0.16,
    hornSwayMultiplier: 0.9
  },
  largest: {
    strideFrequency: 0.16,
    dualThumpOffset: 0.38,
    legSwingAmplitude: 0.25,
    headBobAmplitude: 0.19,
    hornSwayMultiplier: 0.75
  },
  giant: {
    strideFrequency: 0.13,
    dualThumpOffset: 0.40,
    legSwingAmplitude: 0.28,
    headBobAmplitude: 0.22,
    hornSwayMultiplier: 0.65
  }
};

/**
 * Returns the gait configuration for a given size
 */
export function getGaitProfile(size?: string): GoatGaitConfig {
  if (!size) return GAIT_PROFILES.standard;
  return GAIT_PROFILES[size] || GAIT_PROFILES.standard;
}

/**
 * Calculates dual-thump hoof phases for equine-inspired gallop rhythm
 */
export function calculateGallopPhases(
  frame: number,
  speed: number,
  size?: string
): { leadPhase: number; trailPhase: number; isLeadStrike: boolean; isTrailStrike: boolean } {
  const profile = getGaitProfile(size);
  const normalizedSpeed = Math.max(0.5, speed);
  const phase = (frame * profile.strideFrequency * (normalizedSpeed / 2.0)) % (Math.PI * 2);
  const trailPhase = (phase + profile.dualThumpOffset * Math.PI * 2) % (Math.PI * 2);

  // Discrete strike moments (near bottom of swing)
  const isLeadStrike = Math.cos(phase) > 0.95;
  const isTrailStrike = Math.cos(trailPhase) > 0.95;

  return { leadPhase: phase, trailPhase, isLeadStrike, isTrailStrike };
}

/**
 * Damped harmonic oscillation for goat stumbling on obstacle impact
 */
export function calculateStumbleWobble(stumbleTimer: number, maxTimer: number = 45): number {
  if (stumbleTimer <= 0) return 0;
  const t = (maxTimer - stumbleTimer) / 10;
  const decay = Math.exp(-0.8 * t);
  const oscillation = Math.sin(t * 8.0);
  return decay * oscillation * 0.35;
}

// Modular registry for General (Preserved for compatibility)
export const GENERAL_DATA = {
  GAIT_PROFILES,
  getGaitProfile,
  calculateGallopPhases,
  calculateStumbleWobble
};
