/**
 * System Security - APM OS MSDOS Subsystem
 * MS-DOS legacy platform profile, BIOS interrupt profiling,
 * VGA Mode 13h video signatures, and Sound Blaster IRQ/DMA address mapping.
 */

export interface MSDOSPlatformProfile {
  osName: 'MS-DOS';
  version: '3.3' | '5.0' | '6.22' | '7.1';
  biosInterrupts: {
    INT_10H_VIDEO: string;
    INT_13H_DISK: string;
    INT_16H_KEYBOARD: string;
    INT_21H_DOS_API: string;
    INT_33H_MOUSE: string;
  };
  audioHardware: {
    soundBlasterBasePort: string;
    soundBlasterIRQ: number;
    soundBlasterDMA: number;
    adlibFMPort: string;
  };
  videoMode: 'MODE_13H_320x200_256COLOR' | 'TEXT_80x25' | 'VGA_640x480';
}

export const STANDARD_MSDOS_PROFILE: MSDOSPlatformProfile = {
  osName: 'MS-DOS',
  version: '6.22',
  biosInterrupts: {
    INT_10H_VIDEO: '0x10_VIDEO_SERVICE_READY',
    INT_13H_DISK: '0x13_DIRECT_DISK_SERVICE_READY',
    INT_16H_KEYBOARD: '0x16_KEYBOARD_BUFFER_READY',
    INT_21H_DOS_API: '0x21_EXEC_FILE_ROUTINES_READY',
    INT_33H_MOUSE: '0x33_TWO_BUTTON_MOUSE_DRIVER_READY'
  },
  audioHardware: {
    soundBlasterBasePort: '0x220',
    soundBlasterIRQ: 7,
    soundBlasterDMA: 1,
    adlibFMPort: '0x388'
  },
  videoMode: 'MODE_13H_320x200_256COLOR'
};

export class MSDOSPlatformModule {
  private static instance: MSDOSPlatformModule;

  public static getInstance(): MSDOSPlatformModule {
    if (!MSDOSPlatformModule.instance) {
      MSDOSPlatformModule.instance = new MSDOSPlatformModule();
    }
    return MSDOSPlatformModule.instance;
  }

  public getProfile(): MSDOSPlatformProfile {
    return STANDARD_MSDOS_PROFILE;
  }

  /**
   * Computes legacy Sound Blaster BLASTER environment variable string
   */
  public generateBlasterEnvironmentString(): string {
    const hw = STANDARD_MSDOS_PROFILE.audioHardware;
    return `A220 I${hw.soundBlasterIRQ} D${hw.soundBlasterDMA} H5 T6 P${hw.adlibFMPort}`;
  }
}
