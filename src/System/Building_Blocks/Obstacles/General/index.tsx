/**
 * Building Blocks Obstacles Module
 * Physical dimensions and bounding boxes for obstacles.
 */

export interface ObstaclePhysicalSpec {
  type: string;
  boundingRadius: number;
  height: number;
  clearedScore: number;
}

export const OBSTACLE_SPECS: Record<string, ObstaclePhysicalSpec> = {
  log: { type: 'log', boundingRadius: 40, height: 30, clearedScore: 10 },
  rock: { type: 'rock', boundingRadius: 50, height: 45, clearedScore: 15 },
  bush: { type: 'bush', boundingRadius: 35, height: 25, clearedScore: 10 },
  fence: { type: 'fence', boundingRadius: 30, height: 50, clearedScore: 20 },
  crate: { type: 'crate', boundingRadius: 45, height: 40, clearedScore: 15 }
};

export function getObstacleSpec(type: string): ObstaclePhysicalSpec {
  return OBSTACLE_SPECS[type] || OBSTACLE_SPECS['log'];
}
