/**
 * System Security - APM Any_Hardware Subsystem
 * Hardware identification, universal peripheral probing logic,
 * GPU/Audio capabilities, and bus latency detection.
 */

import { calculateAPMHash } from '../General';

export interface HardwareProbeResult {
  hasAudioContext: boolean;
  hasWebGL: boolean;
  hasWebGL2: boolean;
  hasWebGPU: boolean;
  maxTextureSize: number;
  unmaskedRenderer: string;
  unmaskedVendor: string;
  gamepadsConnected: number;
  touchPoints: number;
  memoryEstimateGB: number;
  hardwareFingerprint: string;
}

export class AnyHardwareProber {
  private static instance: AnyHardwareProber;

  public static getInstance(): AnyHardwareProber {
    if (!AnyHardwareProber.instance) {
      AnyHardwareProber.instance = new AnyHardwareProber();
    }
    return AnyHardwareProber.instance;
  }

  /**
   * Universal peripheral and hardware acceleration probing
   */
  public probeHardware(): HardwareProbeResult {
    let hasAudioContext = false;
    let hasWebGL = false;
    let hasWebGL2 = false;
    let hasWebGPU = false;
    let maxTextureSize = 0;
    let unmaskedRenderer = 'Generic/Emulated';
    let unmaskedVendor = 'Generic/Emulated';
    let gamepadsConnected = 0;
    let touchPoints = 0;
    let memoryEstimateGB = 4;

    if (typeof window !== 'undefined') {
      // Audio probe
      hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext);

      // WebGL Probe
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          hasWebGL = true;
          hasWebGL2 = !!canvas.getContext('webgl2');
          maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
          
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || unmaskedVendor;
            unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || unmaskedRenderer;
          }
        }
      } catch (e) {
        // Fallback for non-graphical / headless environments
      }

      // WebGPU Probe
      if ('gpu' in navigator && (navigator as any).gpu) {
        hasWebGPU = true;
      }

      // Gamepads Probe
      if (typeof navigator.getGamepads === 'function') {
        try {
          const gamepads = navigator.getGamepads();
          gamepadsConnected = Array.from(gamepads).filter(g => g !== null).length;
        } catch (e) {
          gamepadsConnected = 0;
        }
      }

      // Touch Points Probe
      touchPoints = navigator.maxTouchPoints || 0;

      // Memory Probe
      if ('deviceMemory' in navigator) {
        memoryEstimateGB = (navigator as any).deviceMemory || 4;
      }
    }

    const rawString = `${unmaskedVendor}:${unmaskedRenderer}:${maxTextureSize}:${touchPoints}:${memoryEstimateGB}`;
    const hardwareFingerprint = calculateAPMHash(rawString);

    return {
      hasAudioContext,
      hasWebGL,
      hasWebGL2,
      hasWebGPU,
      maxTextureSize,
      unmaskedRenderer,
      unmaskedVendor,
      gamepadsConnected,
      touchPoints,
      memoryEstimateGB,
      hardwareFingerprint
    };
  }
}
