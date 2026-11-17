/**
 * System Security - APM OS Subsystem
 * Extended operating system architectures, retro/legacy platforms,
 * modern commercial operating system classifications, and MSDOS sub-module export.
 */

export * from './MSDOS';

import { MSDOSPlatformModule, MSDOSPlatformProfile } from './MSDOS';

export type OperatingSystemFamily = 
  | 'WINDOWS'
  | 'MACOS'
  | 'IOS'
  | 'ANDROID'
  | 'CHROMEOS'
  | 'MSDOS'
  | 'UNKNOWN';

export interface ExtendedOSClassification {
  family: OperatingSystemFamily;
  isModernWebPlatform: boolean;
  isLegacyOS: boolean;
  msdosProfile?: MSDOSPlatformProfile;
  userAgentSnapshot: string;
}

export class ExtendedOSClassifier {
  private static instance: ExtendedOSClassifier;

  public static getInstance(): ExtendedOSClassifier {
    if (!ExtendedOSClassifier.instance) {
      ExtendedOSClassifier.instance = new ExtendedOSClassifier();
    }
    return ExtendedOSClassifier.instance;
  }

  public classifyOS(): ExtendedOSClassification {
    let ua = '';
    if (typeof navigator !== 'undefined') {
      ua = navigator.userAgent.toLowerCase();
    }

    let family: OperatingSystemFamily = 'UNKNOWN';
    let isLegacy = false;

    if (/msdos|dosbox/i.test(ua)) {
      family = 'MSDOS';
      isLegacy = true;
    } else if (/windows/i.test(ua)) {
      family = 'WINDOWS';
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      family = 'IOS';
    } else if (/android/i.test(ua)) {
      family = 'ANDROID';
    } else if (/mac os x|macintosh/i.test(ua)) {
      family = 'MACOS';
    } else if (/cros/i.test(ua)) {
      family = 'CHROMEOS';
    }

    return {
      family,
      isModernWebPlatform: !isLegacy,
      isLegacyOS: isLegacy,
      msdosProfile: family === 'MSDOS' ? MSDOSPlatformModule.getInstance().getProfile() : undefined,
      userAgentSnapshot: ua
    };
  }
}
