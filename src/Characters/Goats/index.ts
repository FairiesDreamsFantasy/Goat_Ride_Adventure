import { GoatCharacteristics } from '../../System/Logic/types';
import { SNOWY_DATA } from './Snowy/goatData';
import { THUNDER_DATA } from './Thunder/goatData';
import { SHADOW_DATA } from './Shadow/goatData';
import { BELLA_DATA } from './Bella/goatData';
import { GOLIATH_DATA } from './Goliath/goatData';
import { FRECKLES_DATA } from './Freckles/goatData';
import { OBSIDIAN_DATA } from './Obsidian/goatData';
import { GINGER_DATA } from './Ginger/goatData';
import { QUICKSILVER_DATA } from './Quicksilver/goatData';
import { PATCHES_DATA } from './Patches/goatData';
import { DUSTY_DATA } from './Dusty/goatData';
import { LUNA_DATA } from './Luna/goatData';
import { AURUM_DATA } from './Aurum/goatData';
import { ALPINE_DATA } from './Alpine/goatData';
import { WILLOW_DATA } from './Willow/goatData';
import { RUBY_DATA } from './Ruby/goatData';
import { HYPERION_DATA } from './Hyperion/goatData';
import { AETHER_DATA } from './Aether/goatData';

export const ALL_GOATS: Record<string, GoatCharacteristics> = {
  white_standard: SNOWY_DATA,
  mountain_ram: THUNDER_DATA,
  charcoal_dweller: SHADOW_DATA,
  fancy_doe: BELLA_DATA,
  brown_giant: GOLIATH_DATA,
  spotted_leaper: FRECKLES_DATA,
  black_knight: OBSIDIAN_DATA,
  ginger_snap: GINGER_DATA,
  silver_streak: QUICKSILVER_DATA,
  patchwork_pal: PATCHES_DATA,
  dusty_trail: DUSTY_DATA,
  midnight_mist: LUNA_DATA,
  golden_horn: AURUM_DATA,
  alpine_spirit: ALPINE_DATA,
  forest_fawn: WILLOW_DATA,
  ruby_raider: RUBY_DATA,
};

// Generates dynamic premium goats if the user unlocks via settings API key
export function getAvailableGoats(): Record<string, GoatCharacteristics> {
  const hasKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');
  if (!hasKey) {
    return ALL_GOATS;
  }
  
  return {
    ...ALL_GOATS,
    hyperion_behemoth: HYPERION_DATA,
    aether_colossus: AETHER_DATA
  };
}

