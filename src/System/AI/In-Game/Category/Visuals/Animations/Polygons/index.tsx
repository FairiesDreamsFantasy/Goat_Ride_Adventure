/**
 * Visuals Polygons Animation Subsystem
 * System/AI/In-Game/Category/Visuals/Animations/Polygons/index.tsx
 *
 * Implements low-poly mesh tessellation, surface normal calculation,
 * dynamic vertex extrusion for hurdles and obstacles, and face lighting dot-products.
 */

export interface PolygonVertex {
  x: number;
  y: number;
  z: number;
  u?: number;
  v?: number;
}

export interface PolygonFace {
  indices: [number, number, number]; // Triangular face
  normal: PolygonVertex;
  colorHex: string;
}

export interface PolygonMesh {
  id: string;
  name: string;
  vertices: PolygonVertex[];
  faces: PolygonFace[];
}

/**
 * Calculates surface normal of a triangular polygon face.
 */
export function calculateFaceNormal(
  v0: PolygonVertex,
  v1: PolygonVertex,
  v2: PolygonVertex
): PolygonVertex {
  const ax = v1.x - v0.x;
  const ay = v1.y - v0.y;
  const az = v1.z - v0.z;

  const bx = v2.x - v0.x;
  const by = v2.y - v0.y;
  const bz = v2.z - v0.z;

  // Cross product
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;

  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
  return { x: nx / len, y: ny / len, z: nz / len };
}

/**
 * Computes face diffuse shading intensity from directional light vector.
 */
export function calculateFaceShading(
  normal: PolygonVertex,
  lightDir: PolygonVertex = { x: 0.577, y: 0.577, z: -0.577 },
  ambientLight: number = 0.25
): number {
  const dot = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
  const diffuse = Math.max(0, dot);
  return Math.min(1.0, ambientLight + (1.0 - ambientLight) * diffuse);
}

/**
 * Procedurally generates a low-poly triangular prism obstacle mesh.
 */
export function generateObstaclePrismMesh(
  width: number,
  height: number,
  depth: number,
  colorHex: string = '#E57373'
): PolygonMesh {
  const hw = width * 0.5;
  const vertices: PolygonVertex[] = [
    { x: -hw, y: 0, z: -depth * 0.5 },
    { x: hw, y: 0, z: -depth * 0.5 },
    { x: 0, y: height, z: -depth * 0.5 },
    { x: -hw, y: 0, z: depth * 0.5 },
    { x: hw, y: 0, z: depth * 0.5 },
    { x: 0, y: height, z: depth * 0.5 }
  ];

  const makeFace = (i0: number, i1: number, i2: number): PolygonFace => ({
    indices: [i0, i1, i2],
    normal: calculateFaceNormal(vertices[i0], vertices[i1], vertices[i2]),
    colorHex
  });

  const faces: PolygonFace[] = [
    makeFace(0, 1, 2), // Front
    makeFace(5, 4, 3), // Back
    makeFace(0, 2, 5), // Left side 1
    makeFace(0, 5, 3), // Left side 2
    makeFace(1, 4, 5), // Right side 1
    makeFace(1, 5, 2)  // Right side 2
  ];

  return {
    id: `prism_${width}_${height}_${depth}`,
    name: 'Obstacle Triangular Prism',
    vertices,
    faces
  };
}

export const POLYGONS_DATA = {
  calculateFaceNormal,
  calculateFaceShading,
  generateObstaclePrismMesh
};

export default POLYGONS_DATA;
