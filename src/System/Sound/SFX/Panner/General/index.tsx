/**
 * SFX Audio Panner General Module
 */

import { PannerConfig, PannerEngine } from '../../../Panner/General';

export interface SFX_PannerConfig extends PannerConfig {
  dopplerFactor: number;
}

export class SFX_PannerEngine extends PannerEngine {
  // SFX specific Panner overrides
}
