/**
 * System Security - APM Open-Source_OS Free-DOS Subsystem
 * Free-DOS platform profile, 16-bit real mode memory architecture,
 * interrupt INT 21h emulation signatures, and conventional memory profiling.
 */

export interface FreeDOSPlatformProfile {
  osName: 'FreeDOS';
  version: string;
  kernelVersion: string;
  conventionalMemoryKB: number;
  extendedMemoryKB: number;
  expandedMemoryAvailable: boolean;
  int21hSupported: boolean;
  ansiDriverLoaded: boolean;
}

export const DEFAULT_FREEDOS_PROFILE: FreeDOSPlatformProfile = {
  osName: 'FreeDOS',
  version: '1.3',
  kernelVersion: '2043',
  conventionalMemoryKB: 640,
  extendedMemoryKB: 65536,
  expandedMemoryAvailable: true,
  int21hSupported: true,
  ansiDriverLoaded: true
};

export class FreeDOSPlatformModule {
  private static instance: FreeDOSPlatformModule;

  public static getInstance(): FreeDOSPlatformModule {
    if (!FreeDOSPlatformModule.instance) {
      FreeDOSPlatformModule.instance = new FreeDOSPlatformModule();
    }
    return FreeDOSPlatformModule.instance;
  }

  public getProfile(): FreeDOSPlatformProfile {
    return DEFAULT_FREEDOS_PROFILE;
  }

  /**
   * Generates a deterministic virtual INT 21h call signature for DOS validation
   */
  public generateInterruptSignature(ahFunctionCode: number, alSubFunction: number): string {
    const combined = ((ahFunctionCode & 0xFF) << 8) | (alSubFunction & 0xFF);
    return `INT21_AX_${combined.toString(16).toUpperCase().padStart(4, '0')}`;
  }
}
