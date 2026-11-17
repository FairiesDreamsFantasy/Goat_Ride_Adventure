/**
 * Biological & Behavioral Goat AI Specifications
 * Scientific kinetics, mass-to-impulse ratios, and vocalization triggers for Capra hircus racers.
 */

export interface GoatKinematicSpec {
  jumpImpulse: number;
  gravityConstant: number;
  stumbleResistance: number; // 0.0 to 1.0 (higher = recovers faster)
  agilityFactor: number;     // lateral lane transition speed
  nominalSpeedRange: [number, number];
}

export const GOAT_BREED_KINEMATICS: Record<string, GoatKinematicSpec> = {
  small: {
    jumpImpulse: 0.44,
    gravityConstant: 0.015,
    stumbleResistance: 0.85,
    agilityFactor: 1.25,
    nominalSpeedRange: [1.9, 2.6]
  },
  standard: {
    jumpImpulse: 0.50,
    gravityConstant: 0.015,
    stumbleResistance: 0.75,
    agilityFactor: 1.0,
    nominalSpeedRange: [1.8, 2.4]
  },
  large: {
    jumpImpulse: 0.55,
    gravityConstant: 0.015,
    stumbleResistance: 0.70,
    agilityFactor: 0.90,
    nominalSpeedRange: [1.8, 2.3]
  },
  largest: {
    jumpImpulse: 0.62,
    gravityConstant: 0.015,
    stumbleResistance: 0.60,
    agilityFactor: 0.75,
    nominalSpeedRange: [1.7, 2.2]
  },
  giant: {
    jumpImpulse: 0.68,
    gravityConstant: 0.015,
    stumbleResistance: 0.50,
    agilityFactor: 0.65,
    nominalSpeedRange: [1.6, 2.1]
  }
};

export interface GoatTemperamentSpec {
  reactionLookahead: number; // world units ahead to scan for obstacles
  jumpPreference: number;    // 0.0 to 1.0 (preference to vault rather than switch lane)
  overtakeAggression: number;// willingness to pull out and pass
  draftWillingness: number;  // inclination to slipstream behind leaders
  bleatFrequency: number;    // base bleat probability per frame
}

export const GOAT_TEMPERAMENTS: Record<string, GoatTemperamentSpec> = {
  cautious: {
    reactionLookahead: 340,
    jumpPreference: 0.35,
    overtakeAggression: 0.30,
    draftWillingness: 0.40,
    bleatFrequency: 0.0008
  },
  steady: {
    reactionLookahead: 260,
    jumpPreference: 0.55,
    overtakeAggression: 0.60,
    draftWillingness: 0.65,
    bleatFrequency: 0.0012
  },
  aggressive: {
    reactionLookahead: 190,
    jumpPreference: 0.85,
    overtakeAggression: 0.90,
    draftWillingness: 0.85,
    bleatFrequency: 0.0018
  }
};

/**
 * Returns calibrated kinematic specs for a goat size
 */
export function getGoatKinematics(size?: string): GoatKinematicSpec {
  if (!size) return GOAT_BREED_KINEMATICS.standard;
  return GOAT_BREED_KINEMATICS[size] || GOAT_BREED_KINEMATICS.standard;
}

/**
 * Returns behavioral temperament specs for a goat style
 */
export function getGoatTemperament(style?: string): GoatTemperamentSpec {
  if (!style) return GOAT_TEMPERAMENTS.steady;
  return GOAT_TEMPERAMENTS[style] || GOAT_TEMPERAMENTS.steady;
}

// Modular registry for General (Preserved for compatibility)
export const GENERAL_DATA = {
  GOAT_BREED_KINEMATICS,
  GOAT_TEMPERAMENTS,
  getGoatKinematics,
  getGoatTemperament
};
