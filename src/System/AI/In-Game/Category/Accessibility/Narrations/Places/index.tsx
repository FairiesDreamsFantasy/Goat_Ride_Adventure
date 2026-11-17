/**
 * Procedural Places & Biome Narration Registry
 * Replaces hardcoded string literals with procedural telemetry-driven environmental synthesis.
 * Implements scientific reverberation characteristics and procedural landmark generation.
 */

export interface BiomeAcousticProfile {
  reverberationDecaySec: number;
  highFrequencyDampening: number;
  absorptionCoefficient: number;
  ambientHumHz: number;
  echoDelayMs: number;
}

export interface BiomeNarrationModel {
  id: string;
  biomeName: string;
  elevationMeters: [number, number];
  acousticProfile: BiomeAcousticProfile;
  surfaceType: 'limestone_rock' | 'dense_moss' | 'synthetic_alloy' | 'volcanic_ash' | 'crystalline_ice' | 'granite';
  generateAtmosphereDescription: (level: number, progressFraction: number) => string;
  generateLandmarkDescription: (waypointDistanceMeters: number, elevation: number) => string;
}

export const BIOME_NARRATION_REGISTRY: Record<string, BiomeNarrationModel> = {
  nebula_plains: {
    id: 'nebula_plains',
    biomeName: 'Nebula Plains',
    elevationMeters: [1200, 1600],
    acousticProfile: {
      reverberationDecaySec: 0.85,
      highFrequencyDampening: 0.15,
      absorptionCoefficient: 0.22,
      ambientHumHz: 110,
      echoDelayMs: 140
    },
    surfaceType: 'crystalline_ice',
    generateAtmosphereDescription: (level, progress) => {
      const pct = Math.round(progress * 100);
      return `Traversing Nebula Plains at sector ${level}. Atmospheric ion density steady at ${pct} percent course completion. Low-friction crystalline surface.`;
    },
    generateLandmarkDescription: (dist, elevation) => {
      return `Approaching Ion Beacon in ${Math.round(dist)} meters, elevation ${Math.round(elevation)} meters.`;
    }
  },
  cyber_city: {
    id: 'cyber_city',
    biomeName: 'Cyber City',
    elevationMeters: [40, 350],
    acousticProfile: {
      reverberationDecaySec: 2.1,
      highFrequencyDampening: 0.45,
      absorptionCoefficient: 0.12,
      ambientHumHz: 60,
      echoDelayMs: 220
    },
    surfaceType: 'synthetic_alloy',
    generateAtmosphereDescription: (level, progress) => {
      return `Sector ${level} Cyber City elevated transit line. Steel alloy decking, electromagnetic hum active, course progress ${Math.round(progress * 100)} percent.`;
    },
    generateLandmarkDescription: (dist, elevation) => {
      return `Upcoming skybridge junction in ${Math.round(dist)} meters at elevation ${Math.round(elevation)} meters.`;
    }
  },
  mountain_pass: {
    id: 'mountain_pass',
    biomeName: 'Alpine Mountain Pass',
    elevationMeters: [2100, 3800],
    acousticProfile: {
      reverberationDecaySec: 1.4,
      highFrequencyDampening: 0.28,
      absorptionCoefficient: 0.35,
      ambientHumHz: 82,
      echoDelayMs: 180
    },
    surfaceType: 'granite',
    generateAtmosphereDescription: (level, progress) => {
      return `Alpine Mountain Pass at ridge ${level}. Granite rock face with open chasm on outer bounds. Progress ${Math.round(progress * 100)} percent.`;
    },
    generateLandmarkDescription: (dist, elevation) => {
      return `Approaching Mountain Summit Gorge in ${Math.round(dist)} meters, peak elevation ${Math.round(elevation)} meters.`;
    }
  },
  jungle_forest: {
    id: 'jungle_forest',
    biomeName: 'Primeval Jungle Forest',
    elevationMeters: [300, 750],
    acousticProfile: {
      reverberationDecaySec: 0.65,
      highFrequencyDampening: 0.72,
      absorptionCoefficient: 0.68,
      ambientHumHz: 145,
      echoDelayMs: 95
    },
    surfaceType: 'dense_moss',
    generateAtmosphereDescription: (level, progress) => {
      return `Canopy Jungle course ${level}. Humid moss-covered terrain with heavy acoustic dampening. Course progress ${Math.round(progress * 100)} percent.`;
    },
    generateLandmarkDescription: (dist, elevation) => {
      return `Ancient Root Archway in ${Math.round(dist)} meters, altitude ${Math.round(elevation)} meters.`;
    }
  },
  cavern_caves: {
    id: 'cavern_caves',
    biomeName: 'Subterranean Caverns',
    elevationMeters: [-150, 80],
    acousticProfile: {
      reverberationDecaySec: 3.4,
      highFrequencyDampening: 0.18,
      absorptionCoefficient: 0.08,
      ambientHumHz: 48,
      echoDelayMs: 310
    },
    surfaceType: 'limestone_rock',
    generateAtmosphereDescription: (level, progress) => {
      return `Subterranean Cavern subterranean depth ${level}. Enclosed limestone vaults with continuous reverberation. ${Math.round(progress * 100)} percent traversed.`;
    },
    generateLandmarkDescription: (dist, elevation) => {
      return `Stalactite Chasm crossing ahead in ${Math.round(dist)} meters at depth ${Math.round(Math.abs(elevation))} meters.`;
    }
  }
};

/**
 * Resolves current biome based on level number and progress in the 400-level continuum.
 */
export function resolveBiomeForLevel(level: number): BiomeNarrationModel {
  const keys = Object.keys(BIOME_NARRATION_REGISTRY);
  const normalizedIndex = Math.abs(Math.floor((level - 1) / 10)) % keys.length;
  const biomeKey = keys[normalizedIndex] || 'mountain_pass';
  return BIOME_NARRATION_REGISTRY[biomeKey];
}

/**
 * Procedurally generates on-demand environment report (bound to "B" key).
 */
export function generateEnvironmentNarration(level: number, progressFraction: number, z: number): string {
  const biome = resolveBiomeForLevel(level);
  const elevation = biome.elevationMeters[0] + (biome.elevationMeters[1] - biome.elevationMeters[0]) * Math.abs(Math.sin(z * 0.001));
  return `${biome.generateAtmosphereDescription(level, progressFraction)} Surface: ${biome.surfaceType.replace('_', ' ')}. Reverberation decay: ${biome.acousticProfile.reverberationDecaySec.toFixed(1)} seconds.`;
}

export const PLACES_DATA = {
  BIOME_NARRATION_REGISTRY,
  resolveBiomeForLevel,
  generateEnvironmentNarration
};

export default PLACES_DATA;
