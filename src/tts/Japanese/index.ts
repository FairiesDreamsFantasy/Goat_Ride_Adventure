export interface TTSModule {
  lang: string;
  pitch: number;
  rate: number;
  voiceName?: string;
}

export const config: TTSModule = {
  lang: 'ja-JP',
  pitch: 1,
  rate: 1
};

