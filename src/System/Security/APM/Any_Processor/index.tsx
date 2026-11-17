/**
 * System Security - APM Any_Processor Subsystem
 * CPU concurrency profiling, logical core detection,
 * execution timing benchmarks, and architecture profiling.
 */

import { APMArchitectureType } from '../General';

export interface ProcessorMetrics {
  logicalCores: number;
  architecture: APMArchitectureType;
  benchmarkScoreMops: number;
  timingJitterMicroseconds: number;
  isHighConcurrency: boolean;
  instructionSetTag: string;
}

export class AnyProcessorProfiler {
  private static instance: AnyProcessorProfiler;

  public static getInstance(): AnyProcessorProfiler {
    if (!AnyProcessorProfiler.instance) {
      AnyProcessorProfiler.instance = new AnyProcessorProfiler();
    }
    return AnyProcessorProfiler.instance;
  }

  /**
   * Profiles the active CPU architecture and performs a micro-benchmark
   */
  public profileProcessor(): ProcessorMetrics {
    let cores = 4;
    let architecture: APMArchitectureType = 'x86_64';
    let userAgent = '';

    if (typeof navigator !== 'undefined') {
      cores = navigator.hardwareConcurrency || 4;
      userAgent = navigator.userAgent.toLowerCase();
    }

    if (/arm64|aarch64|iphone|ipad|apple/i.test(userAgent)) {
      architecture = 'arm64';
    } else if (/armv7|arm32/i.test(userAgent)) {
      architecture = 'arm32';
    } else if (/x86_64|win64|x64|wow64/i.test(userAgent)) {
      architecture = 'x86_64';
    } else if (/i686|i386|x86/i.test(userAgent)) {
      architecture = 'x86_32';
    }

    // Micro-benchmark: 50,000 arithmetic and bitwise cycles
    const start = performance.now();
    let acc = 0x5A5A5A5A;
    for (let i = 0; i < 50000; i++) {
      acc = (acc ^ (i * 0x45D9F3B)) + ((acc << 5) | (acc >>> 27));
    }
    const elapsedMs = Math.max(performance.now() - start, 0.001);
    const benchmarkScoreMops = Math.round((50000 / (elapsedMs * 1000)) * 100) / 100;

    // Timing jitter test
    const t0 = performance.now();
    const t1 = performance.now();
    const timingJitterMicroseconds = Math.round(Math.abs(t1 - t0) * 1000);

    const isHighConcurrency = cores >= 8;
    const instructionSetTag = `${architecture.toUpperCase()}_x${cores}_${benchmarkScoreMops}MOPS`;

    return {
      logicalCores: cores,
      architecture,
      benchmarkScoreMops,
      timingJitterMicroseconds,
      isHighConcurrency,
      instructionSetTag
    };
  }
}
