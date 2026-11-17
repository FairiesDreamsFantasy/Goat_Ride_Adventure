/**
 * System Security - APM Game_Consoles Subsystem
 * Game console profiles, controller input mapping matrices,
 * gamepad standard layout binding, and joystick axis calibrations.
 */

export interface GamepadButtonMapping {
  jumpButtonIndex: number;
  strafeLeftButtonIndex: number;
  strafeRightButtonIndex: number;
  pauseButtonIndex: number;
  cruiseControlButtonIndex: number;
  scanOpponentsButtonIndex: number;
  readScreenButtonIndex: number;
}

export interface GameConsoleProfile {
  consoleType: 'PLAYSTATION' | 'XBOX' | 'NINTENDO_SWITCH' | 'STEAM_DECK' | 'GENERIC_ARCADE' | 'UNKNOWN';
  controllerMapping: GamepadButtonMapping;
  isHandheld: boolean;
  rumbleSupported: boolean;
  analogStickDeadzone: number;
}

export const STANDARD_XBOX_MAPPING: GamepadButtonMapping = {
  jumpButtonIndex: 0,            // A
  strafeLeftButtonIndex: 14,     // D-Pad Left
  strafeRightButtonIndex: 15,    // D-Pad Right
  pauseButtonIndex: 9,           // Start / Menu
  cruiseControlButtonIndex: 2,   // X
  scanOpponentsButtonIndex: 3,   // Y
  readScreenButtonIndex: 4       // Left Bumper (LB)
};

export const STANDARD_PLAYSTATION_MAPPING: GamepadButtonMapping = {
  jumpButtonIndex: 0,            // Cross
  strafeLeftButtonIndex: 14,     // D-Pad Left
  strafeRightButtonIndex: 15,    // D-Pad Right
  pauseButtonIndex: 9,           // Options
  cruiseControlButtonIndex: 2,   // Square
  scanOpponentsButtonIndex: 3,   // Triangle
  readScreenButtonIndex: 4       // L1
};

export const STANDARD_NINTENDO_MAPPING: GamepadButtonMapping = {
  jumpButtonIndex: 1,            // A (Nintendo Layout)
  strafeLeftButtonIndex: 14,     // D-Pad Left
  strafeRightButtonIndex: 15,    // D-Pad Right
  pauseButtonIndex: 9,           // Plus (+)
  cruiseControlButtonIndex: 3,   // Y
  scanOpponentsButtonIndex: 2,   // X
  readScreenButtonIndex: 4       // L
};

export class GameConsoleControllerMatrix {
  private static instance: GameConsoleControllerMatrix;

  public static getInstance(): GameConsoleControllerMatrix {
    if (!GameConsoleControllerMatrix.instance) {
      GameConsoleControllerMatrix.instance = new GameConsoleControllerMatrix();
    }
    return GameConsoleControllerMatrix.instance;
  }

  public detectConsoleProfile(): GameConsoleProfile {
    let userAgent = '';
    if (typeof navigator !== 'undefined') {
      userAgent = navigator.userAgent.toLowerCase();
    }

    if (/playstation|dualshock|dualsense/i.test(userAgent)) {
      return {
        consoleType: 'PLAYSTATION',
        controllerMapping: STANDARD_PLAYSTATION_MAPPING,
        isHandheld: false,
        rumbleSupported: true,
        analogStickDeadzone: 0.15
      };
    }

    if (/xbox/i.test(userAgent)) {
      return {
        consoleType: 'XBOX',
        controllerMapping: STANDARD_XBOX_MAPPING,
        isHandheld: false,
        rumbleSupported: true,
        analogStickDeadzone: 0.15
      };
    }

    if (/nintendo|switch/i.test(userAgent)) {
      return {
        consoleType: 'NINTENDO_SWITCH',
        controllerMapping: STANDARD_NINTENDO_MAPPING,
        isHandheld: true,
        rumbleSupported: true,
        analogStickDeadzone: 0.20
      };
    }

    if (/valve|steamdeck/i.test(userAgent)) {
      return {
        consoleType: 'STEAM_DECK',
        controllerMapping: STANDARD_XBOX_MAPPING,
        isHandheld: true,
        rumbleSupported: true,
        analogStickDeadzone: 0.12
      };
    }

    return {
      consoleType: 'GENERIC_ARCADE',
      controllerMapping: STANDARD_XBOX_MAPPING,
      isHandheld: false,
      rumbleSupported: false,
      analogStickDeadzone: 0.18
    };
  }
}
