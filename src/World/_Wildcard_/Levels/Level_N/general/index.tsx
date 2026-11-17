/**
 * Provides dynamic level resolution for Levels 1 through 400.
 */
import { getLevelConfig } from '../../General';

export function getLevelNConfig(levelNumber: number) {
  return getLevelConfig(levelNumber);
}
