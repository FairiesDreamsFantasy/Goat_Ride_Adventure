/**
 * System Controllers - GamepadConfig
 * Calibration, axis thresholds, and action button indices mapping for external USB controllers.
 */

export const GamepadConfig = {
  deadzone: 0.15,
  axes: {
    LS_X: 0,
    LS_Y: 1,
    RS_X: 2,
    RS_Y: 3
  },
  buttons: {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    SELECT: 8,
    START: 9
  }
};
