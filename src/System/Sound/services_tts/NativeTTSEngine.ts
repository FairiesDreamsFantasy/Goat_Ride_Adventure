import { ITTSEngine } from "./types";
import { config as enUsConfig } from "../../../tts/EN_US";
import { config as enRastafariConfig } from "../../../tts/En_Rastafari";
import { config as enJpUkConfig } from "../../../tts/En_JP/UK";
import { config as enJpUsConfig } from "../../../tts/En_JP/US";
import { config as japaneseConfig } from "../../../tts/Japanese";
import { config as enRpConfig } from "../../../tts/EN_En-RP";

/**
 * NativeTTSEngine uses the browser's built-in SpeechSynthesis API.
 * This is "onboard" as it runs locally on the user's machine/OS.
 */
export class NativeTTSEngine implements ITTSEngine {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  isAvailable(): boolean {
    return !!this.synth;
  }

  async speak(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error("SpeechSynthesis not available"));
        return;
      }

      // Stop current speech to prevent overlapping and reduce bloat
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select config based on language
      let config = enUsConfig;
      switch (language) {
        case 'EN_US': config = enUsConfig; break;
        case 'En_Rastafari': config = enRastafariConfig; break;
        case 'En_JP_UK': config = enJpUkConfig; break;
        case 'En_JP_US': config = enJpUsConfig; break;
        case 'Japanese': config = japaneseConfig; break;
        case 'EN_En-RP': config = enRpConfig; break;
      }
      
      utterance.lang = config.lang;
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      
      // Try to find a good voice
      const voices = this.synth.getVoices();
      let voice = voices.find(v => v.lang === config.lang);
      
      if (config.voiceName) {
        const namedVoice = voices.find(v => v.name.includes(config.voiceName!));
        if (namedVoice) voice = namedVoice;
      }

      if (voice) {
        utterance.voice = voice;
      }

      console.log(`NativeTTSEngine: Speaking "${text.substring(0, 20)}..." in ${language}`);
      utterance.onstart = () => console.log(`NativeTTSEngine: Speech started`);
      utterance.onend = () => {
        console.log(`NativeTTSEngine: Speech ended`);
        resolve();
      };
      utterance.onerror = (event: any) => {
        console.error(`NativeTTSEngine: Speech error`, event);
        // 'interrupted' and 'canceled' are normal when we call stop() to play a new message
        // Also resolve on other errors to prevent crashing the app if TTS fails
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  stop(): void {
    if (this.isAvailable()) {
      this.synth.cancel();
    }
  }
}
