/**
 * System Security - APM (AnythingPlatformModuleController) Master Subsystem
 * Centralized orchestrator singleton managing universal hardware probing,
 * virtual register state arrays, platform classification, and deterministic
 * cryptographic state validation.
 */

export * from './General';
export * from './Any_Hardware';
export * from './Any_Machine';
export * from './Any_Processor';
export * from './Game_Consoles';
export * from './Open-Source_OS';
export * from './OS';

import {
  APMProfile,
  APMVirtualRegisterState,
  DEFAULT_APM_VIRTUAL_REGISTERS,
  calibrateAPMVirtualRegisters,
  calculateAPMHash
} from './General';
import { AnyHardwareProber } from './Any_Hardware';
import { AnyMachineClassifier } from './Any_Machine';
import { AnyProcessorProfiler } from './Any_Processor';
import { GameConsoleControllerMatrix } from './Game_Consoles';
import { OpenSourceOSDetector } from './Open-Source_OS';
import { ExtendedOSClassifier } from './OS';

export class AnythingPlatformModuleController {
  private static instance: AnythingPlatformModuleController;
  private currentProfile: APMProfile | null = null;
  private virtualRegisters: APMVirtualRegisterState = { ...DEFAULT_APM_VIRTUAL_REGISTERS };
  private lastProbeTime: number = 0;

  public static getInstance(): AnythingPlatformModuleController {
    if (!AnythingPlatformModuleController.instance) {
      AnythingPlatformModuleController.instance = new AnythingPlatformModuleController();
    }
    return AnythingPlatformModuleController.instance;
  }

  /**
   * Initializes and executes full-stack universal platform calibration and cryptographic profiling
   */
  public calibrateAndProbePlatform(): APMProfile {
    const hw = AnyHardwareProber.getInstance().probeHardware();
    const machine = AnyMachineClassifier.getInstance().classifyMachine();
    const processor = AnyProcessorProfiler.getInstance().profileProcessor();
    const consoleProfile = GameConsoleControllerMatrix.getInstance().detectConsoleProfile();
    const openSourceOS = OpenSourceOSDetector.getInstance().detect();
    const extendedOS = ExtendedOSClassifier.getInstance().classifyOS();

    const timestamp = Date.now();
    const entropySeed = (timestamp ^ (processor.benchmarkScoreMops * 1000) ^ (hw.touchPoints << 4)) >>> 0;
    const platformTag = `${machine.formFactor}_${processor.architecture}_${extendedOS.family}_${openSourceOS.detectedOS}`;

    // Compute updated virtual register state
    this.virtualRegisters = calibrateAPMVirtualRegisters(entropySeed, platformTag);
    this.lastProbeTime = timestamp;

    const signaturePayload = `${platformTag}:${hw.hardwareFingerprint}:${processor.instructionSetTag}:${this.virtualRegisters.REG_ENTROPY_HASH}`;
    const cryptographicSignature = calculateAPMHash(signaturePayload);

    const profile: APMProfile = {
      id: `APM_${timestamp.toString(16).toUpperCase()}_${cryptographicSignature.slice(2, 6)}`,
      timestamp,
      platformType: machine.formFactor,
      architecture: processor.architecture,
      cores: processor.logicalCores,
      deviceMemoryGB: hw.memoryEstimateGB,
      screenResolution: {
        width: machine.screenDimensions.width,
        height: machine.screenDimensions.height,
        colorDepth: machine.screenDimensions.colorDepth,
        pixelRatio: machine.screenDimensions.pixelRatio
      },
      gamepadsDetected: hw.gamepadsConnected,
      hasTouchScreen: machine.isTouchCapable,
      hasWebGPU: hw.hasWebGPU,
      hasWebGL2: hw.hasWebGL2,
      hasAudioContext: hw.hasAudioContext,
      virtualRegisters: this.virtualRegisters,
      cryptographicSignature
    };

    this.currentProfile = profile;
    return profile;
  }

  /**
   * Returns current active profile or auto-calibrates if not yet evaluated
   */
  public getActiveProfile(): APMProfile {
    if (!this.currentProfile || Date.now() - this.lastProbeTime > 60000) {
      return this.calibrateAndProbePlatform();
    }
    return this.currentProfile;
  }

  /**
   * Returns live virtual register array state
   */
  public getVirtualRegisters(): APMVirtualRegisterState {
    return { ...this.virtualRegisters };
  }

  /**
   * Validates cryptographic platform state against active registers
   */
  public validatePlatformIntegrity(): boolean {
    const profile = this.getActiveProfile();
    const isRegistersValid = profile.virtualRegisters.REG_CR0 === 0x80050033 &&
      profile.virtualRegisters.REG_ENTROPY_HASH.startsWith('0x');
    return isRegistersValid && !!profile.cryptographicSignature;
  }
}
