export interface TTSModule {
  lang: string;
  pitch: number;
  rate: number;
  voiceName?: string;
}

export const config: TTSModule = {
  lang: 'en-GB',
  pitch: 1.1,
  rate: 0.95,
  voiceName: 'Received Pronunciation'
};

