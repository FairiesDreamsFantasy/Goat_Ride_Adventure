/**
 * System Security - APM Any_Machine Subsystem
 * System-level machine classification metrics, device form-factor detection,
 * power profiles, and physical host environment profiling.
 */

import { APMPlatformType } from '../General';

export interface MachineMetrics {
  formFactor: APMPlatformType;
  screenDimensions: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    pixelRatio: number;
    colorDepth: number;
  };
  orientation: 'landscape' | 'portrait';
  isMobileDevice: boolean;
  isTouchCapable: boolean;
  machineClassification: string;
}

export class AnyMachineClassifier {
  private static instance: AnyMachineClassifier;

  public static getInstance(): AnyMachineClassifier {
    if (!AnyMachineClassifier.instance) {
      AnyMachineClassifier.instance = new AnyMachineClassifier();
    }
    return AnyMachineClassifier.instance;
  }

  public classifyMachine(): MachineMetrics {
    let width = 1920;
    let height = 1080;
    let availWidth = 1920;
    let availHeight = 1040;
    let pixelRatio = 1;
    let colorDepth = 24;
    let isMobile = false;
    let touchCapable = false;
    let userAgent = '';

    if (typeof window !== 'undefined') {
      width = window.innerWidth || screen.width || 1920;
      height = window.innerHeight || screen.height || 1080;
      availWidth = screen.availWidth || width;
      availHeight = screen.availHeight || height;
      pixelRatio = window.devicePixelRatio || 1;
      colorDepth = screen.colorDepth || 24;
      touchCapable = navigator.maxTouchPoints > 0;
      userAgent = navigator.userAgent.toLowerCase();
    }

    const orientation: 'landscape' | 'portrait' = width >= height ? 'landscape' : 'portrait';

    // Classification heuristic
    let formFactor: APMPlatformType = 'DESKTOP';
    if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      formFactor = width < 600 ? 'MOBILE' : 'TABLET';
      isMobile = true;
    } else if (/ipad/i.test(userAgent) || (touchCapable && width >= 768 && width <= 1366)) {
      formFactor = 'TABLET';
      isMobile = true;
    } else if (/playstation|xbox|nintendo|switch/i.test(userAgent)) {
      formFactor = 'CONSOLE';
    } else if (touchCapable && width < 600) {
      formFactor = 'MOBILE';
      isMobile = true;
    } else if (width < 1440 && touchCapable) {
      formFactor = 'LAPTOP';
    } else {
      formFactor = 'DESKTOP';
    }

    const machineClassification = `${formFactor}_${orientation.toUpperCase()}_${width}x${height}@${pixelRatio}x`;

    return {
      formFactor,
      screenDimensions: {
        width,
        height,
        availWidth,
        availHeight,
        pixelRatio,
        colorDepth
      },
      orientation,
      isMobileDevice: isMobile,
      isTouchCapable: touchCapable,
      machineClassification
    };
  }
}
