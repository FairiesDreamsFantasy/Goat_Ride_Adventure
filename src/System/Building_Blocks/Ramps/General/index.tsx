/**
 * Building Blocks Ramps Module
 * Incline calculations for vertical elevation changes and jump boost ramps.
 */

export interface RampSpec {
  inclineAngleDegrees: number;
  lengthFeet: number;
  launchBoost: number;
}

export function calculateRampLaunchVelocity(ramp: RampSpec, entrySpeed: number): number {
  const rad = (ramp.inclineAngleDegrees * Math.PI) / 180;
  return entrySpeed * Math.sin(rad) * ramp.launchBoost;
}
