/**
 * Rider General Registry
 * Provides fallback constants, universal gear calibration, and default state bindings.
 */

export const GENERAL_RIDER_CONSTANTS = {
  DEFAULT_HELMET_MASS_KG: 1.15,
  STIRRUP_FORCE_ABSORPTION_EFFICIENCY: 0.88,
  MAX_ALLOWED_STEER_RATE: 2.4,
  SADDLE_FRICTION_COEFFICIENT: 0.76
};

export const GENERAL_DATA = {
  ...GENERAL_RIDER_CONSTANTS
};

export default GENERAL_DATA;
