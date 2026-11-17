/**
 * System Controllers - Default Keyboard Layout
 * Standard retro mappings including movement arrows, screen reader on-demand keys,
 * and game state triggers.
 */

export const DefaultLayout = {
  movement: {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    JUMP: ' ' // Space key
  },
  accessibility: {
    ANNOUNCE_B: 'b',
    ANNOUNCE_A: 'a',
    ANNOUNCE_W: 'w',
    ANNOUNCE_C: 'c',
    SCAN_OPPONENTS: 'o'
  },
  system: {
    TOGGLE_PAUSE: 'Shift' // Combined with keycode checking
  }
};
