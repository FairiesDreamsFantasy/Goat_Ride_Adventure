/**
 * System Security - APM Open-Source_OS Subsystem
 * Open-source operating system detection matrices, aggregator
 * for Free-DOS, Linux, and POSIX open-source platforms.
 */

export * from './Free-DOS';
export * from './Linux';

import { FreeDOSPlatformModule, FreeDOSPlatformProfile } from './Free-DOS';
import { LinuxPlatformModule, LinuxPlatformProfile } from './Linux';

export type OpenSourceOSKind = 'FreeDOS' | 'Linux' | 'BSD' | 'Other_OpenSource' | 'None';

export interface OpenSourceOSDetectionResult {
  detectedOS: OpenSourceOSKind;
  isConfirmedOpenSource: boolean;
  freeDOSProfile?: FreeDOSPlatformProfile;
  linuxProfile?: LinuxPlatformProfile;
  compatibilityFlags: string[];
}

export class OpenSourceOSDetector {
  private static instance: OpenSourceOSDetector;

  public static getInstance(): OpenSourceOSDetector {
    if (!OpenSourceOSDetector.instance) {
      OpenSourceOSDetector.instance = new OpenSourceOSDetector();
    }
    return OpenSourceOSDetector.instance;
  }

  public detect(): OpenSourceOSDetectionResult {
    let userAgent = '';
    if (typeof navigator !== 'undefined') {
      userAgent = navigator.userAgent.toLowerCase();
    }

    if (/linux/i.test(userAgent)) {
      const linuxProfile = LinuxPlatformModule.getInstance().detectLinuxEnvironment();
      return {
        detectedOS: 'Linux',
        isConfirmedOpenSource: true,
        linuxProfile,
        compatibilityFlags: ['POSIX', 'ELF_EXEC', 'PIPES', 'PTHREADS']
      };
    }

    if (/freedos|dosbox|msdos/i.test(userAgent)) {
      const freeDOSProfile = FreeDOSPlatformModule.getInstance().getProfile();
      return {
        detectedOS: 'FreeDOS',
        isConfirmedOpenSource: true,
        freeDOSProfile,
        compatibilityFlags: ['REAL_MODE_16BIT', 'INT_21H', 'CONVENTIONAL_MEMORY']
      };
    }

    return {
      detectedOS: 'None',
      isConfirmedOpenSource: false,
      compatibilityFlags: ['BROWSER_WASM_SANDBOX']
    };
  }
}
