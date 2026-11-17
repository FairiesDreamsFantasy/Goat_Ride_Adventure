/**
 * BGM Digital Signal Processing (DSP) General Module
 */

import { DSPConfig, DSPEngine } from '../../../DSP/General';

export interface BGM_DSPConfig extends DSPConfig {
  fadeOutTime: number;
  fadeInTime: number;
}

export class BGM_DSPEngine extends DSPEngine {
  // BGM specific DSP overrides
}
