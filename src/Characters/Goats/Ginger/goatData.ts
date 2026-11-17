import { GoatCharacteristics, AudioParams } from '../../../System/Logic/types';
import { GOAT_DESCRIPTION } from './Description';
import { GOAT_DIMENSIONS } from './Dimensions';
import { AUDIO_PARAMS, GAIT_FREQUENCIES } from './Animations/General';

export const GINGER_DATA: GoatCharacteristics = {
  ...GOAT_DESCRIPTION,
  ...GOAT_DIMENSIONS,
  size: GOAT_DIMENSIONS.size as any,
  description: GOAT_DESCRIPTION.text as any,
  audio: AUDIO_PARAMS as AudioParams,
  gait: GAIT_FREQUENCIES as any
};
