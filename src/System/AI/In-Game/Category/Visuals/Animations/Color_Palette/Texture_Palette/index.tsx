/**
 * Visuals Texture Palette Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Color_Palette/Texture_Palette/index.tsx
 *
 * Implements procedural surface texture parameters (roughness, specular exponents,
 * asphalt micro-grain noise, rock strata) eliminating hardcoded canvas textures.
 */

export interface SurfaceTextureSpec {
  textureId: string;
  name: string;
  baseColorHex: string;
  roughness: number; // 0.0 (smooth mirror) to 1.0 (rough chalk)
  specularPower: number;
  bumpScale: number;
  grainDensityHz: number;
}

export const TEXTURE_REGISTRY: Record<string, SurfaceTextureSpec> = {
  granite_crag: {
    textureId: 'granite_crag',
    name: 'Alpine Granite Crag',
    baseColorHex: '#5C6B73',
    roughness: 0.88,
    specularPower: 4.0,
    bumpScale: 1.4,
    grainDensityHz: 42.0
  },
  cyber_synthetic_tread: {
    textureId: 'cyber_synthetic_tread',
    name: 'Cyber Alloy Tread',
    baseColorHex: '#252830',
    roughness: 0.22,
    specularPower: 64.0,
    bumpScale: 0.6,
    grainDensityHz: 120.0
  },
  cavern_limestone: {
    textureId: 'cavern_limestone',
    name: 'Subterranean Limestone',
    baseColorHex: '#4A4E51',
    roughness: 0.75,
    specularPower: 8.0,
    bumpScale: 1.1,
    grainDensityHz: 35.0
  },
  ice_shelf_crystalline: {
    textureId: 'ice_shelf_crystalline',
    name: 'Crystalline Ice Shelf',
    baseColorHex: '#C5E3F6',
    roughness: 0.08,
    specularPower: 128.0,
    bumpScale: 0.2,
    grainDensityHz: 80.0
  }
};

/**
 * Computes procedural noise perturbation for micro-surface grain.
 */
export function calculateTextureNoise(u: number, v: number, density: number = 40.0): number {
  const sinU = Math.sin(u * density);
  const cosV = Math.cos(v * density * 1.37);
  return (sinU * cosV + 1.0) * 0.5;
}

export const TEXTURE_PALETTE_DATA = {
  TEXTURE_REGISTRY,
  calculateTextureNoise
};

export default TEXTURE_PALETTE_DATA;
