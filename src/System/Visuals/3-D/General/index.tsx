/**
 * Visuals 3-D - General Module
 * Advanced vertex buffers, polygon matrices, texture uv mapping coordinates,
 * and normal computation models to support sophisticated retro-rendering.
 */

export interface Vertex3D {
  x: number;
  y: number;
  z: number;
  u: number; // Texture mapping coord
  v: number; // Texture mapping coord
}

export interface Face3D {
  indices: number[]; // Index array pointing to vertices list
  color: string;
}

export class RenderModel3D {
  public vertices: Vertex3D[] = [];
  public faces: Face3D[] = [];

  constructor(vertices: Vertex3D[], faces: Face3D[]) {
    this.vertices = vertices;
    this.faces = faces;
  }

  /**
   * Applies scaling transformations to model geometry
   */
  public scaleModel(sx: number, sy: number, sz: number): void {
    for (const vert of this.vertices) {
      vert.x *= sx;
      vert.y *= sy;
      vert.z *= sz;
    }
  }
}
