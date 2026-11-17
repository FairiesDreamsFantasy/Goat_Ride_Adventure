/**
 * TTS Engine Interface
 */
export interface ITTSEngine {
  speak(text: string, language: string): Promise<void>;
  stop(): void;
  isAvailable(): boolean;
}
