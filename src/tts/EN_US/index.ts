export interface TTSModule {
  lang: string;
  pitch: number;
  rate: number;
  voiceName?: string;
}

export const config: TTSModule = {
  lang: 'en-US',
  pitch: 1,
  rate: 1
};

