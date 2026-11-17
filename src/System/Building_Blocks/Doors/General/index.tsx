/**
 * Building Blocks Doors Module
 * Structural doorways and passageways.
 */

export interface DoorSpec {
  isOpen: boolean;
  width: number;
  type: 'archway' | 'barn_door' | 'cyber_gate' | 'dungeon_grate';
}
