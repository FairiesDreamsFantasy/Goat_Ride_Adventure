export interface TTSModule {
  lang: string;
  pitch: number;
  rate: number;
  voiceName?: string;
}

export const config: TTSModule = {
  lang: 'en-GB',
  pitch: 1.2,
  rate: 1.1,
  voiceName: 'Japanese Dialect'
};

