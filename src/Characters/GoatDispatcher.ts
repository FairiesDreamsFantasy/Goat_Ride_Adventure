import { GoatCharacteristics } from '../System/Logic/types';
import { renderSnowy } from './Goats/Snowy/GoatVisuals';
import { renderThunder } from './Goats/Thunder/GoatVisuals';

export type GoatRenderFn = (ctx: CanvasRenderingContext2D, char: GoatCharacteristics, sizeScale: number, bobOffset: number) => void;

export const GOAT_VISUALS: Record<string, GoatRenderFn> = {
  white_standard: renderSnowy,
  mountain_ram: renderThunder,
  // Fallback to Snowy for others until implemented
  charcoal_dweller: renderSnowy,
  fancy_doe: renderSnowy,
  brown_giant: renderSnowy,
  spotted_leaper: renderSnowy,
  black_knight: renderSnowy,
  ginger_snap: renderSnowy,
  silver_streak: renderSnowy,
  patchwork_pal: renderSnowy,
  dusty_trail: renderSnowy,
  midnight_mist: renderSnowy,
  golden_horn: renderSnowy,
  alpine_spirit: renderSnowy,
  forest_fawn: renderSnowy,
  ruby_raider: renderSnowy,
};
