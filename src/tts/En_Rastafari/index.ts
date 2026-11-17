export interface TTSModule {
  lang: string;
  pitch: number;
  rate: number;
  voiceName?: string;
}

export const config: TTSModule = {
  lang: 'en-GB', // Use UK as base for Rastafari
  pitch: 0.8,
  rate: 0.9,
  voiceName: 'Rastafari' // Custom hint
};

