/**
 * General Pseudorandom Functions (PRNG)
 * Scientific deterministic random number generation for game physics, terrain, and AI.
 */

// Mulberry32 deterministic stateful PRNG
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic hash from integer coordinates / seeds
export function hashSeed(x: number, z: number, salt: number = 1337): number {
  let h = (x * 374761393) ^ (z * 668265263) ^ (salt * 1446845212);
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

// Bounded deterministic random float [min, max)
export function pseudoRandomRange(seed: number, min: number, max: number): number {
  const prng = mulberry32(seed);
  return min + prng() * (max - min);
}

// Bounded deterministic random integer [min, max]
export function pseudoRandomInt(seed: number, min: number, max: number): number {
  const prng = mulberry32(seed);
  return Math.floor(min + prng() * (max - min + 1));
}

// Gaussian / Normal Distribution PRNG (Box-Muller transform)
export function pseudoGaussian(seed: number, mean: number = 0, stdDev: number = 1): number {
  const prng = mulberry32(seed);
  const u1 = Math.max(0.0001, prng());
  const u2 = prng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

// 1D Smooth Noise function for organic camera sway and path curves without spikes
export function smooth1DNoise(x: number, seed: number = 42): number {
  const i = Math.floor(x);
  const f = x - i;
  const smoothF = f * f * (3 - 2 * f); // Smoothstep interpolation
  
  const h1 = hashSeed(i, 0, seed) / 4294967296;
  const h2 = hashSeed(i + 1, 0, seed) / 4294967296;
  
  return h1 * (1 - smoothF) + h2 * smoothF;
}
