import { ITTSEngine } from "./types";
import { NativeTTSEngine } from "./NativeTTSEngine";

/**
 * TTSManager handles using the native browser TTS engine.
 */
export class TTSManager {
  private nativeEngine: NativeTTSEngine;
  private currentEngine: ITTSEngine;

  constructor(ctx: AudioContext, ttsGain: GainNode) {
    this.nativeEngine = new NativeTTSEngine();
    this.currentEngine = this.nativeEngine; // Now exclusively native
  }

  setEngine(type: 'native') {
    this.currentEngine = this.nativeEngine;
    console.log("TTSManager: System is locked to native engine mode.");
  }

  async speak(text: string, language: string): Promise<void> {
    try {
      await this.currentEngine.speak(text, language);
    } catch (e) {
      console.error("TTSManager: speak failed", e);
    }
  }

  stop(): void {
    this.currentEngine.stop();
  }
}
