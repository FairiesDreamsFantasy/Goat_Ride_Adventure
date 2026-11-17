/**
 * Modular registry & Animal AI Evaluator for Goat
 * Calibrates kinetic jumping parameters, situational vocalizations, and behavioral impulses.
 */

import {
  GOAT_BREED_KINEMATICS,
  GOAT_TEMPERAMENTS,
  getGoatKinematics,
  getGoatTemperament,
  GoatKinematicSpec,
  GoatTemperamentSpec
} from './General';

export * from './General';

/**
 * Calculates optimal jump launch velocity (vy) for an opponent goat
 */
export function calculateGoatJumpVelocity(
  size?: string,
  style?: string,
  jumpMod: number = 1.0
): number {
  const kin = getGoatKinematics(size);
  const temp = getGoatTemperament(style);
  // Aggressive goats launch with slightly more vigor
  const aggressionBonus = temp.jumpPreference > 0.7 ? 0.03 : 0.0;
  return (kin.jumpImpulse + aggressionBonus) * jumpMod;
}

/**
 * Determines if a situational vocalization (bleat) is triggered
 */
export function evaluateBleatEvent(
  event: 'overtake' | 'vault' | 'bump' | 'idle',
  style?: string,
  randomRoll: number = Math.random()
): boolean {
  const temp = getGoatTemperament(style);

  switch (event) {
    case 'overtake':
      // Bleats in triumph when overtaking another runner or player
      return randomRoll < (temp.overtakeAggression * 0.75);
    case 'vault':
      // Celebratory bleat when cleanly clearing a high hurdle
      return randomRoll < 0.25;
    case 'bump':
      // Complaint bleat when stumbling
      return randomRoll < 0.85;
    case 'idle':
    default:
      return randomRoll < temp.bleatFrequency;
  }
}

// Modular registry for Goat (Preserved for compatibility)
export const GOAT_DATA = {
  calculateGoatJumpVelocity,
  evaluateBleatEvent,
  getGoatKinematics,
  getGoatTemperament,
  GOAT_BREED_KINEMATICS,
  GOAT_TEMPERAMENTS
};
