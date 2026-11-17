import { RiderCharacter } from '../../../System/Logic/types';
import { RIDER_DESCRIPTION } from './Description';
import { RIDER_DIMENSIONS } from './Dimensions';

export const ALEXANDER_DATA: RiderCharacter = {
  id: 'alexander',
  ...RIDER_DESCRIPTION,
  ...RIDER_DIMENSIONS
};
