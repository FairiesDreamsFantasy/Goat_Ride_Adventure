/**
 * BGM Audio Equalizer General Module
 */

import { EqualizerConfig, EqualizerEngine } from '../../../Equalizer/General';

export interface BGM_EqualizerConfig extends EqualizerConfig {
  lowPassFrequency: number;
}

export class BGM_EqualizerEngine extends EqualizerEngine {
  // BGM specific Equalizer overrides
}
