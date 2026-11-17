/**
 * Audio Equalizer General Module
 */

export interface EQBand {
  frequency: number;
  q: number;
  gain: number;
  type: BiquadFilterType;
}

export interface EqualizerConfig {
  bands: EQBand[];
}

export const DEFAULT_EQ_CONFIG: EqualizerConfig = {
  bands: [
    { frequency: 60, q: 1, gain: 0, type: 'lowshelf' },
    { frequency: 170, q: 1, gain: 0, type: 'peaking' },
    { frequency: 310, q: 1, gain: 0, type: 'peaking' },
    { frequency: 600, q: 1, gain: 0, type: 'peaking' },
    { frequency: 1000, q: 1, gain: 0, type: 'peaking' },
    { frequency: 3000, q: 1, gain: 0, type: 'peaking' },
    { frequency: 6000, q: 1, gain: 0, type: 'peaking' },
    { frequency: 12000, q: 1, gain: 0, type: 'peaking' },
    { frequency: 14000, q: 1, gain: 0, type: 'highshelf' },
  ],
};

export class EqualizerEngine {
  constructor(public config: EqualizerConfig = DEFAULT_EQ_CONFIG) {}

  applyFilter(bandIndex: number, gain: number) {
    if (this.config.bands[bandIndex]) {
      this.config.bands[bandIndex].gain = gain;
    }
  }
}
