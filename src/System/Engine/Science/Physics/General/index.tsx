/**
 * Science - Physics General Sub-Engine
 * High-performance bounding box/cylinder collision calculators, speed gates, and jump dynamics.
 */

export interface BoundingBox {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

export class PhysicsCalculator {
  public static GRAVITY = -9.81; // m/s^2 Standard

  /**
   * Calculates vertical position during a jump arc using kinematics
   */
  public static getJumpHeight(initialVelocityY: number, timeElapsed: number): number {
    return (initialVelocityY * timeElapsed) + (0.5 * this.GRAVITY * timeElapsed * timeElapsed);
  }

  /**
   * Performs an Axis-Aligned Bounding Box (AABB) intersection check
   */
  public static checkCollision(box1: BoundingBox, box2: BoundingBox): boolean {
    return (
      Math.abs(box1.x - box2.x) * 2 < (box1.width + box2.width) &&
      Math.abs(box1.y - box2.y) * 2 < (box1.height + box2.height) &&
      Math.abs(box1.z - box2.z) * 2 < (box1.depth + box2.depth)
    );
  }
}
