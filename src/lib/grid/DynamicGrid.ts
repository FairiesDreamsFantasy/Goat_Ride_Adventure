import { Direction, GridPos } from '../../types';

export interface GridDimensions {
  width: number;
  height: number;
}

export const getDynamicDisplayCoords = (nx: number, ny: number, dir: Direction, dims: GridDimensions): GridPos => {
  const NEXT_X = dims.width + 1;
  const NEXT_Y = dims.height + 1;
  switch (dir) {
    case 'North': return { x: nx, y: ny };
    case 'South': return { x: NEXT_X - nx, y: NEXT_Y - ny };
    case 'East': return { x: NEXT_Y - ny, y: nx };
    case 'West': return { x: ny, y: NEXT_X - nx };
    default: return { x: nx, y: ny };
  }
};
