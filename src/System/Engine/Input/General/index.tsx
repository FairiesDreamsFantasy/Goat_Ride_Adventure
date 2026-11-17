/**
 * Input - General Sub-Engine
 * Core controller mapping, polling, 8-lane strafe computations, and key code states.
 */

export class InputEngine {
  private keyState: Record<string, boolean> = {};
  private laneCount: number = 8;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => this.keyState[e.key] = true);
      window.addEventListener('keyup', (e) => this.keyState[e.key] = false);
    }
  }

  public isPressed(key: string): boolean {
    return !!this.keyState[key];
  }

  /**
   * Calculates target horizontal position coordinates based on an 8-lane grid
   */
  public calculateLaneOffset(currentLane: number, totalWidth: number): number {
    const laneWidth = totalWidth / this.laneCount;
    // Align lane coordinate centered inside each distinct segment
    return (currentLane * laneWidth) - (totalWidth / 2) + (laneWidth / 2);
  }
}
