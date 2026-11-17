/**
 * Visuals Animations Unified Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/index.tsx
 *
 * Master procedural visual pipeline unifying 2-D transforms, 3-D perspective matrices,
 * Polygons low-poly tessellation, Pixelations & Dot-Matrix rasterization,
 * Geometry parametric track curvature, and procedural Color Palettes.
 */

import { TWO_D_DATA } from './2-D';
import { THREE_D_DATA } from './3-D';
import { POLYGONS_DATA } from './Polygons';
import { PIXELATIONS_DATA } from './Pixelations';
import { GEOMETRY_DATA } from './Geometry';
import { COLOR_PALETTE_DATA } from './Color_Palette';

export interface VisualPipelineFrameState {
  level: number;
  z: number;
  speed: number;
  playerLane: number;
  gaitPhase: number;
  viewportWidth: number;
  viewportHeight: number;
  isMonochromeActive: boolean;
}

export class VisualPipelineEngine {
  /**
   * Evaluates complete environmental visual rendering frame parameters.
   */
  public evaluateFrame(state: VisualPipelineFrameState) {
    const theme = COLOR_PALETTE_DATA.resolveThemeForLevel(state.level);
    const curvature = GEOMETRY_DATA.calculateTrackCurvatureAtZ(state.z, state.level);
    const banking = GEOMETRY_DATA.calculateRoadBankingAngle(state.z, state.level, state.speed);
    const headBob = THREE_D_DATA.calculateRiderPOVHeadBob(state.gaitPhase);
    const billboard = TWO_D_DATA.calculate2DBillboardOscillation(state.gaitPhase);

    return {
      theme,
      curvature,
      banking,
      headBob,
      billboard
    };
  }
}

export const ANIMATIONS_VISUALS_DATA = {
  VisualPipelineEngine,
  TWO_D: TWO_D_DATA,
  THREE_D: THREE_D_DATA,
  POLYGONS: POLYGONS_DATA,
  PIXELATIONS: PIXELATIONS_DATA,
  GEOMETRY: GEOMETRY_DATA,
  COLOR_PALETTE: COLOR_PALETTE_DATA
};

export * from './2-D';
export * from './3-D';
export * from './Polygons';
export * from './Pixelations';
export * from './Geometry';
export * from './Color_Palette';

export default ANIMATIONS_VISUALS_DATA;
