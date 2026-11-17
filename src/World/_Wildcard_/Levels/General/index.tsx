/**
 * General Levels Mathematics & Configuration Engine
 * Provides deterministic calculation and parameter sets for Levels 1 through 400.
 */

import { hashSeed, pseudoRandomRange } from '../../../../System/AI/In-Game/Category/Pseudorandom_Functions/General';
import { KENYA_PLACE_CONFIG } from '../../../../Places/Kenya';
import { SOUTH_AFRICA_PLACE_CONFIG } from '../../../../Places/South_Africa';
import { EGYPT_PLACE_CONFIG } from '../../../../Places/Egypt';
import { ANTARCTICA_PLACE_CONFIG } from '../../../../Places/Antarctica';
import { AUSTRALIA_PLACE_CONFIG } from '../../../../Places/Australia';
import { BRAZIL_PLACE_CONFIG } from '../../../../Places/Brazil';
import { PERU_PLACE_CONFIG } from '../../../../Places/Peru';
import { CHILE_PLACE_CONFIG } from '../../../../Places/Chile';
import { ARGENTINA_PLACE_CONFIG } from '../../../../Places/Argentina';
import { getRandomTreat, GoatTreatSpec } from '../../../../System/Items/Treats';

export type EnvironmentType =
  | 'farm'
  | 'jungle'
  | 'desert'
  | 'city'
  | 'mountain'
  | 'cave'
  | 'nebula_plains'
  | 'cyber_city'
  | 'ice_glacier'
  | 'dungeon'
  | 'savannah'
  | 'coastal_plateau'
  | 'outback';

export interface LevelConfig {
  levelNumber: number;
  environment: EnvironmentType;
  placeName: string;
  courseLength: number; // in feet
  spawnThreshold: number; // feet interval between obstacle spawn attempts
  pathCurveFactor: number;
  maxOpponents: number;
  baseObstacleSpeedMultiplier: number;
  description: string;
}

export const PLACES_ARRAY = [
  KENYA_PLACE_CONFIG,
  SOUTH_AFRICA_PLACE_CONFIG,
  EGYPT_PLACE_CONFIG,
  ANTARCTICA_PLACE_CONFIG,
  AUSTRALIA_PLACE_CONFIG,
  BRAZIL_PLACE_CONFIG,
  PERU_PLACE_CONFIG,
  CHILE_PLACE_CONFIG,
  ARGENTINA_PLACE_CONFIG
];

export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  farm: "Serene countryside pastures with red barns, clover fields, and rustic picket fences.",
  jungle: "Dense wild jungle canopy cover with cascading leaves and mossy logs.",
  desert: "Blistering heat of sun-drenched canyon sand dunes and prickly cacti.",
  city: "Neon-drenched metropolis under midnight skies with asphalt and grid barriers.",
  mountain: "High alpine ridge heights with snowy mountain winds and pine trees.",
  cave: "Underground abyssal caverns with whispering drafts and magnificent stalactites.",
  nebula_plains: "Cosmic expanse of floating celestial stardust and quantum wormholes.",
  cyber_city: "Neon cybernetic grid layout with holographic billboards and digital laser beams.",
  ice_glacier: "Frozen monolith glacier with slick icy paths. Scientifically, hoof pressure compresses snow pack to stabilize permafrost.",
  dungeon: "Subterranean stone-forged structures beneath soaring vent shafts and cavernous abyssal pits."
};

/**
 * Calculates deterministic LevelConfig for any level between 1 and 400.
 */
export function generateLevelConfig(levelNumber: number): LevelConfig {
  const safeLevel = Math.max(1, Math.min(400, Math.floor(levelNumber)));
  
  // Pick place deterministically from PLACES_ARRAY based on safeLevel
  const place = PLACES_ARRAY[(safeLevel - 1) % PLACES_ARRAY.length];
  const environment = place.environmentType as EnvironmentType;

  // Length scales smoothly up to 400 levels
  const courseLength = 45000 + (safeLevel * 5000);

  // Spawn threshold decreases gracefully with level for tighter challenge
  const spawnThreshold = safeLevel === 1 ? 2500 : Math.max(800, 1500 - Math.min(700, safeLevel * 5));

  // Path curvature increases with level
  const pathCurveFactor = safeLevel === 1 ? 0 : Math.min(80, safeLevel * 1.5);

  const maxOpponents = Math.min(8, 3 + Math.floor(safeLevel / 50));
  const baseObstacleSpeedMultiplier = 1.0 + Math.min(1.5, safeLevel * 0.005);

  const description = `Level ${safeLevel} (${place.name}): ${place.description}`;

  return {
    levelNumber: safeLevel,
    environment,
    placeName: place.name,
    courseLength,
    spawnThreshold,
    pathCurveFactor,
    maxOpponents,
    baseObstacleSpeedMultiplier,
    description
  };
}

export const getLevelConfig = generateLevelConfig;

/**
 * Deterministically generates an obstacle definition for a distance point in a level
 */
export interface SpawnedObstacleDef {
  xOffset: number;
  type: string;
  width: number;
}

export function generateObstacleAtDistance(levelNumber: number, distance: number): SpawnedObstacleDef {
  const seed = hashSeed(Math.floor(distance), levelNumber, 8888);
  const types = ['log', 'rock', 'bush', 'fence', 'crate'];
  const typeIndex = Math.floor(pseudoRandomRange(seed, 0, types.length));
  
  const widthRoll = pseudoRandomRange(seed + 1, 0, 1);
  let width = 1;
  let xOffset = (Math.floor(pseudoRandomRange(seed + 2, 0, 8)) - 4) * 100;

  if (widthRoll > 0.95) {
    width = 8;
    xOffset = -50; // Center across all 8 lanes
  } else if (widthRoll > 0.85) {
    width = 3;
  }

  return {
    xOffset,
    type: types[typeIndex],
    width
  };
}

/**
 * Deterministically generates treat items along the track for goats to gobble!
 */
export interface SpawnedTreatDef {
  xOffset: number;
  treatSpec: GoatTreatSpec;
}

export function generateTreatAtDistance(levelNumber: number, distance: number): SpawnedTreatDef {
  const seed = hashSeed(Math.floor(distance), levelNumber, 9999);
  const xOffset = (Math.floor(pseudoRandomRange(seed, 0, 8)) - 4) * 100;
  const treatSpec = getRandomTreat(seed + 77);

  return {
    xOffset,
    treatSpec
  };
}
