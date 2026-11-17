/**
 * BGM Audio Panner General Module
 */

import { PannerConfig, PannerEngine } from '../../../Panner/General';

export interface BGM_PannerConfig extends PannerConfig {
  ambientSpread: number;
}

export class BGM_PannerEngine extends PannerEngine {
  // BGM specific Panner overrides
}
