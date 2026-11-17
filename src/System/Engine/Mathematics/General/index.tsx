/**
 * System Engine Mathematics - General Module
 * Advanced scientific mathematical routines, 3D/2D vector space mechanics,
 * and polynomial/sine-base path curvature functions.
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export class VectorMath {
  public static add(v1: Vector3D, v2: Vector3D): Vector3D {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
  }

  public static subtract(v1: Vector3D, v2: Vector3D): Vector3D {
    return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
  }

  public static scale(v: Vector3D, scalar: number): Vector3D {
    return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
  }

  public static dot(v1: Vector3D, v2: Vector3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  public static magnitude(v: Vector3D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  public static normalize(v: Vector3D): Vector3D {
    const mag = this.magnitude(v);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
  }
}

export class CurvatureEngine {
  /**
   * Generates a scientific sine-base path curve offset based on progress and level complexity
   */
  public static getPathOffset(zProgress: number, level: number): number {
    const frequency = 0.005 + (level * 0.0001);
    const amplitude = Math.min(150, level * 2.5);
    return Math.sin(zProgress * frequency) * amplitude;
  }

  /**
   * Implements a polynomial bezier path interpolation
   */
  public static interpolateBezier(p0: number, p1: number, p2: number, t: number): number {
    const u = 1 - t;
    return u * u * p0 + 2 * u * t * p1 + t * t * p2;
  }
}
