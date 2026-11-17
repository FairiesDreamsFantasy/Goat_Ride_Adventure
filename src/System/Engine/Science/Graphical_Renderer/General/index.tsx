/**
 * Science - Graphical Renderer General Sub-Engine
 * Advanced rasterization metrics, pixel transformations, and camera viewport projections.
 */

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface CameraPerspective {
  fov: number;
  near: number;
  far: number;
  aspectRatio: number;
  headBobFreq: number;
  bobOffset: number;
}

export class ProjectionProcessor {
  /**
   * Projects a 3D coordinate onto a 2D plane with perspective division
   */
  public static projectTo2D(
    x: number,
    y: number,
    z: number,
    viewport: ViewportDimensions,
    camera: CameraPerspective
  ): { x: number; y: number; scale: number } | null {
    if (z <= camera.near || z >= camera.far) {
      return null; // Clip coordinates outside view frustum
    }

    // Apply head bobbing animation calculations based on gait rhythmic frequencies
    const bob = Math.sin(camera.bobOffset * camera.headBobFreq) * 5;
    const adjustedY = y + bob;

    const scale = (camera.fov / 2) / z;
    const screenX = (viewport.width / 2) + x * scale;
    const screenY = (viewport.height / 2) - adjustedY * scale;

    return {
      x: screenX,
      y: screenY,
      scale: scale
    };
  }
}
