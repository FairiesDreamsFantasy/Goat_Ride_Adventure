/**
 * System Security - APM (AnythingPlatformModuleController) General Subsystem
 * Base APM Configuration types, virtual register states, platform profiles,
 * calibration algorithms, and deterministic cryptographic state validation.
 */

export type APMPlatformType = 
  | 'DESKTOP'
  | 'LAPTOP'
  | 'MOBILE'
  | 'TABLET'
  | 'CONSOLE'
  | 'SERVER'
  | 'EMBEDDED'
  | 'VIRTUAL_MACHINE'
  | 'RETRO_EMULATOR'
  | 'UNKNOWN';

export type APMArchitectureType =
  | 'x86_64'
  | 'arm64'
  | 'x86_32'
  | 'arm32'
  | 'wasm'
  | 'riscv'
  | 'mips'
  | 'dos_realmode'
  | 'unknown';

export interface APMVirtualRegisterState {
  REG_EAX: number;
  REG_EBX: number;
  REG_ECX: number;
  REG_EDX: number;
  REG_FLAGS: number;
  REG_CR0: number;
  REG_TIMESTAMP: number;
  REG_ENTROPY_HASH: string;
}

export interface APMProfile {
  id: string;
  timestamp: number;
  platformType: APMPlatformType;
  architecture: APMArchitectureType;
  cores: number;
  deviceMemoryGB?: number;
  screenResolution: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  gamepadsDetected: number;
  hasTouchScreen: boolean;
  hasWebGPU: boolean;
  hasWebGL2: boolean;
  hasAudioContext: boolean;
  virtualRegisters: APMVirtualRegisterState;
  cryptographicSignature: string;
}

export const DEFAULT_APM_VIRTUAL_REGISTERS: APMVirtualRegisterState = {
  REG_EAX: 0x00000001,
  REG_EBX: 0x756e6547,
  REG_ECX: 0x6c65746e,
  REG_EDX: 0x49656e69,
  REG_FLAGS: 0x00000246,
  REG_CR0: 0x80050033,
  REG_TIMESTAMP: Date.now(),
  REG_ENTROPY_HASH: '0x0000000000000000'
};

export const APM_CONSTANTS = {
  VERSION: '2.4.0',
  PLATFORM_PROBE_INTERVAL_MS: 30000,
  ENTROPY_CYCLE_SAMPLE_COUNT: 32,
  MAX_ALLOWED_PROBE_DRIFT_MS: 1500,
  VIRTUAL_BUS_WIDTH_BITS: 64,
  MAX_INPUT_CHANNELS: 16
};

/**
 * Deterministic Murmur-inspired string hashing for platform validation
 */
export function calculateAPMHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return '0x' + (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Calibrates and computes virtual register states from active hardware metrics
 */
export function calibrateAPMVirtualRegisters(
  entropySeed: number,
  platformTag: string
): APMVirtualRegisterState {
  const timestamp = Date.now();
  const rawEntropy = `${platformTag}_${timestamp}_${entropySeed}_${Math.random()}`;
  const hash = calculateAPMHash(rawEntropy);
  
  return {
    REG_EAX: ((timestamp & 0xFFFFFFFF) ^ 0x1A2B3C4D) >>> 0,
    REG_EBX: (Math.imul(entropySeed, 0x5DEECE66D) ^ 0xB) >>> 0,
    REG_ECX: (platformTag.length * 0x9E3779B9) >>> 0,
    REG_EDX: (Math.sin(entropySeed) * 0x7FFFFFFF) >>> 0,
    REG_FLAGS: 0x00000246 | ((entropySeed & 0x7) << 8),
    REG_CR0: 0x80050033,
    REG_TIMESTAMP: timestamp,
    REG_ENTROPY_HASH: hash
  };
}
