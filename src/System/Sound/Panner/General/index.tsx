/**
 * Audio Panner General Module
 */

export interface PannerConfig {
  panningModel: PanningModelType;
  distanceModel: DistanceModelType;
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
}

export const DEFAULT_PANNER_CONFIG: PannerConfig = {
  panningModel: 'equalpower',
  distanceModel: 'inverse',
  refDistance: 1,
  maxDistance: 10000,
  rolloffFactor: 1,
};

export class PannerEngine {
  constructor(public config: PannerConfig = DEFAULT_PANNER_CONFIG) {}

  calculatePosition(x: number, y: number, z: number) {
    return { x, y, z };
  }
}
