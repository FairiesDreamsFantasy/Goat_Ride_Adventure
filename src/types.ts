export type Direction = 'North' | 'South' | 'East' | 'West' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type SynthMode = 'Classic' | 'Advanced' | 'Mix' | 'CLASSIC' | 'ADVANCED';
export type BitMode = '8-bit' | '16-bit' | '64-bit' | '8BIT' | '64BIT';
export type TTSLanguage = 'EN_US' | 'EN_RASTA' | 'EN_JP_UK' | 'EN_JP_US' | 'JAPANESE' | 'EN_RP';

export interface GridPos {
  x: number;
  y: number;
}

export const GAME_WIDTH = 1500;
export const GAME_HEIGHT = 1000;
export const TRUE_BLACK = '#000000';

export interface GameState {
  score: number;
  enemiesKilled: number;
  currentSegment: string | number;
  isPaused: boolean;
  isGameOver: boolean;
  hasAgreedToAntiSpanking: boolean | null;
  inventory: string[];
  viewMode: 'POV' | 'Rider';
  isExploring: boolean;
  activeQuestionId: string | null;
  message?: string;
  awaitingInput?: boolean;
  poodleRiding?: boolean;
  // Legacy properties for linter
  area?: string;
  hasSharedRabbit?: boolean;
  hasOpossumKey?: boolean;
  activeQuestion?: string;
  isRidingOpossum?: boolean;
  gridX?: number;
  gridY?: number;
  hasRefusedShare?: boolean;
  screenReaderText?: string;
  direction?: Direction;
  girlInGarden?: boolean;
  isSelfishSequenceActive?: boolean;
  selfishSequenceStep?: number;
  girlGardenX?: number;
  girlGardenY?: number;
  synthMode?: SynthMode;
  bitMode?: BitMode;
  ttsLanguage?: TTSLanguage;
  gridPos?: GridPos;
}

export const INITIAL_STATE: GameState = {
  score: 0,
  enemiesKilled: 0,
  currentSegment: 'Starting Platform',
  isPaused: false,
  isGameOver: false,
  hasAgreedToAntiSpanking: null,
  inventory: ['Hand Held PC', 'Magic Wand', 'Riding Equipment'],
  viewMode: 'POV',
  isExploring: false,
  activeQuestionId: null,
  area: 'Level_1',
  hasSharedRabbit: false,
  hasOpossumKey: false,
  activeQuestion: undefined,
  isRidingOpossum: false,
  gridX: 0,
  gridY: 0,
  hasRefusedShare: false,
  screenReaderText: '',
  direction: 'North',
  girlInGarden: false,
  isSelfishSequenceActive: false,
  selfishSequenceStep: 0,
  girlGardenX: 0,
  girlGardenY: 0,
  synthMode: 'Classic',
  bitMode: '8-bit',
  ttsLanguage: 'EN_US',
  gridPos: { x: 0, y: 0 },
};
