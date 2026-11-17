
export type TrackType = 'farm' | 'jungle' | 'desert' | 'city' | 'mountain' | 'cave' | 'ice_glacier' | 'dungeon';

export class BGMManager {
  private static ctx: AudioContext | null = null;
  private static currentOsc: OscillatorNode | null = null;

  static playTheme(type: TrackType) {
    // For "High-Fidelity" procedural BGM (simplified for demo)
    console.log(`Now playing BGM for: ${type}`);
  }

  static stop() {
    // Stop all BGM
  }
}
