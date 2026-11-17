import { RiderCharacter } from '../../../System/Logic/types';
import { RIDER_DESCRIPTION } from './Description';
import { RIDER_DIMENSIONS } from './Dimensions';

export const KY_DATA: RiderCharacter = {
  id: 'ky',
  ...RIDER_DESCRIPTION,
  ...RIDER_DIMENSIONS
};
