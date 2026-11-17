import { RiderCharacter } from '../../../System/Logic/types';
import { RIDER_DESCRIPTION } from './Description';
import { RIDER_DIMENSIONS } from './Dimensions';

export const STEVEN_DATA: RiderCharacter = {
  id: 'steven',
  ...RIDER_DESCRIPTION,
  ...RIDER_DIMENSIONS
};
