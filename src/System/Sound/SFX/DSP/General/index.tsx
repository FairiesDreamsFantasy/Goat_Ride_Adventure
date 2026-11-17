/**
 * SFX Digital Signal Processing (DSP) General Module
 */

import { DSPConfig, DSPEngine } from '../../../DSP/General';

export interface SFX_DSPConfig extends DSPConfig {
  reverbAmount: number;
}

export class SFX_DSPEngine extends DSPEngine {
  // SFX specific DSP overrides
}
