export type GameEnvironment = 
  | 'farm' | 'jungle' | 'desert' | 'city' | 'mountain' | 'cave' 
  | 'europe' | 'china' | 'vietnam' | 'thailand' | 'philippines' 
  | 'australia' | 'new_zealand' | 'argentina' | 'montana'
  | 'nebula_plains' | 'crystal_canyon' | 'lava_lake' | 'steam_station' | 'ghost_grove'
  | 'pixel_peaks' | 'cyber_city' | 'glitch_glade' | 'ice_glacier' | 'dungeon';

export const GameStateStatus = {
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  FINISHED: 'FINISHED',
} as const;

export type GameStateStatus = typeof GameStateStatus[keyof typeof GameStateStatus];

export interface AudioParams {
  baseFreq: number;
  duration: number;
  fmRate: number;
  fmDepth: number;
  oscType: OscillatorType;
  filterFreq?: number;
  filterType?: BiquadFilterType;
  filterQ?: number;
  secondOscType?: OscillatorType;
  secondOscFreqRatio?: number;
  pitchSweepRatio?: number;
}

export interface GaitFrequencies {
  walk: number;
  trot: number;
  canter: number;
  gallop: number;
  viriable: number;
  interval: number;
}

export interface GoatCharacteristics {
  name: string;
  color: string;
  gender: string;
  length: string;
  height: string;
  chest: string;
  width: string;
  hornColor: string;
  eyeColor: string;
  size: 'small' | 'medium' | 'large' | 'giant' | 'largest';
  description: string[];
  audio?: AudioParams;
  gait?: GaitFrequencies;
}

export interface RiderCharacter {
  id: string;
  name: string;
  bio: string;
  height: string;
  isDwarf?: boolean;
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  hasEyebrows: boolean;
  hasBeard: boolean;
  attire: {
    summer: string;
    winter: string;
  };
  hasPOV: boolean;
  hasRiderView: boolean;
  babylonFree: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
  speed: number;
  targetSpeed: number;
  isJumping: boolean;
  cruiseControl: boolean;
  characteristics: GoatCharacteristics;
  selectedRider?: RiderCharacter;
  rider?: RiderCharacter;
  lastGallopTime?: number;
}

export interface Obstacle {
  id?: string;
  x: number;
  y?: number;
  z: number;
  width?: number;
  height?: number;
  depth?: number;
  type: string;
  cleared?: boolean;
  passed?: boolean;
}

export interface TreatItem {
  id?: string;
  x: number;
  y?: number;
  z: number;
  type?: string;
  name?: string;
  collected?: boolean;
  spec?: any;
}

export interface ComputerOpponent {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  lane?: number;
  targetLane?: number;
  speed: number;
  goat?: GoatCharacteristics;
  rider?: RiderCharacter;
  isJumping?: boolean;
  size?: string;
  color?: string;
  style?: string;
  vy?: number;
  reactionTime?: number;
  stumbleTimer?: number;
  isDrafting?: boolean;
  isOvertaking?: boolean;
}
