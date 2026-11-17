/**
 * Building Blocks Walls and Barriers Module
 * Handles perimeter barriers, stone walls, and collision bounds.
 */

export interface WallSpec {
  material: 'stone' | 'wood' | 'metal' | 'hedgerow' | 'digital';
  height: number;
  solid: boolean;
}

export function checkWallCollision(playerX: number, laneBounds: [number, number]): boolean {
  return playerX < laneBounds[0] || playerX > laneBounds[1];
}
