/**
 * Pseudorandom Functions Architecture
 * Exports all general PRNG and opponent pseudorandom decision functions.
 */

import * as General from './General';
import * as OpponentsGeneral from './Opponents/General';
import * as Opponents from './Opponents';

export * from './General';
export * from './Opponents/General';
export * from './Opponents';

export const PSEUDORANDOM_FUNCTIONS_DATA = {
  ...General,
  ...OpponentsGeneral,
  ...Opponents
};

export default PSEUDORANDOM_FUNCTIONS_DATA;
