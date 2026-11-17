/**
 * System Security - APM Open-Source_OS Linux Subsystem
 * Linux kernel platform profile, POSIX runtime signatures,
 * distribution fingerprinting, and standard UNIX environment detection.
 */

export interface LinuxPlatformProfile {
  osName: 'Linux';
  kernelArchitecture: 'x86_64' | 'aarch64' | 'armv7l' | 'riscv64' | 'generic';
  isPOSIXCompliant: boolean;
  hasWaylandOrX11: boolean;
  distroFamily: 'Debian' | 'Arch' | 'RedHat' | 'Alpine' | 'Android_Linux' | 'Generic_Linux';
  systemUptimeSeconds: number;
}

export class LinuxPlatformModule {
  private static instance: LinuxPlatformModule;

  public static getInstance(): LinuxPlatformModule {
    if (!LinuxPlatformModule.instance) {
      LinuxPlatformModule.instance = new LinuxPlatformModule();
    }
    return LinuxPlatformModule.instance;
  }

  public detectLinuxEnvironment(): LinuxPlatformProfile {
    let userAgent = '';
    if (typeof navigator !== 'undefined') {
      userAgent = navigator.userAgent.toLowerCase();
    }

    const isAndroid = /android/i.test(userAgent);
    const isArm = /aarch64|armv8|arm/i.test(userAgent);

    return {
      osName: 'Linux',
      kernelArchitecture: isArm ? 'aarch64' : 'x86_64',
      isPOSIXCompliant: true,
      hasWaylandOrX11: !isAndroid,
      distroFamily: isAndroid ? 'Android_Linux' : 'Generic_Linux',
      systemUptimeSeconds: Math.floor(performance.now() / 1000)
    };
  }
}
