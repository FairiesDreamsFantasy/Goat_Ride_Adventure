/**
 * SFX Audio Equalizer General Module
 */

import { EqualizerConfig, EqualizerEngine } from '../../../Equalizer/General';

export interface SFX_EqualizerConfig extends EqualizerConfig {
  highPassFrequency: number;
}

export class SFX_EqualizerEngine extends EqualizerEngine {
  // SFX specific Equalizer overrides
}
