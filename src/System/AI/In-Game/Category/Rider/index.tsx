/**
 * Rider Kinematics & AI Handling Profile Registry
 * Scientific data model governing rider mass distribution, center-of-gravity shifts,
 * biomechanical balance compensation, and aerodynamic posture.
 */

export interface RiderBiomechanicalProfile {
  id: string;
  name: string;
  massKg: number;
  centerOfGravityHeightM: number;
  aerodynamicDragCoefficient: number;
  balanceRecoveryHz: number;
  leanAngleMaxDeg: number;
  gripRetentionFactor: number;
}

export const RIDER_PROFILES: Record<string, RiderBiomechanicalProfile> = {
  jockey_standard: {
    id: 'jockey_standard',
    name: 'Standard Scientific Jockey',
    massKg: 52.0,
    centerOfGravityHeightM: 0.65,
    aerodynamicDragCoefficient: 0.42,
    balanceRecoveryHz: 4.8,
    leanAngleMaxDeg: 34.0,
    gripRetentionFactor: 0.94
  },
  featherweight_scout: {
    id: 'featherweight_scout',
    name: 'Featherweight Alpine Scout',
    massKg: 46.5,
    centerOfGravityHeightM: 0.58,
    aerodynamicDragCoefficient: 0.38,
    balanceRecoveryHz: 5.5,
    leanAngleMaxDeg: 38.0,
    gripRetentionFactor: 0.91
  },
  heavy_cavalry: {
    id: 'heavy_cavalry',
    name: 'Reinforced Endurance Rider',
    massKg: 68.0,
    centerOfGravityHeightM: 0.72,
    aerodynamicDragCoefficient: 0.49,
    balanceRecoveryHz: 3.9,
    leanAngleMaxDeg: 28.0,
    gripRetentionFactor: 0.98
  }
};

/**
 * Calculates dynamic rider lean angle based on lane change velocity and cornering curvature.
 */
export function calculateRiderDynamicLean(
  steerVelocity: number,
  curvature: number,
  rider: RiderBiomechanicalProfile = RIDER_PROFILES.jockey_standard
): number {
  const dynamicFactor = (steerVelocity * 4.2) + (curvature * 12.0);
  const clamped = Math.max(-rider.leanAngleMaxDeg, Math.min(rider.leanAngleMaxDeg, dynamicFactor));
  return clamped;
}

/**
 * Calculates effective combined mass and inertia for goat-rider coupling.
 */
export function calculateRiderSystemInertia(
  goatMassKg: number,
  rider: RiderBiomechanicalProfile = RIDER_PROFILES.jockey_standard
): number {
  return goatMassKg + (rider.massKg * rider.gripRetentionFactor);
}

export const RIDER_DATA = {
  RIDER_PROFILES,
  calculateRiderDynamicLean,
  calculateRiderSystemInertia
};

export default RIDER_DATA;
