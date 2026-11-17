/**
 * System/AI/In-Game/Category/index.tsx
 * Unified Category Entry Point coordinating Animal, Rider, Accessibility,
 * Visuals, and Pseudorandom Functions.
 */

export * from './Animal/Goat';
export * from './Rider';
export * from './Accessibility';
export * from './Visuals/Animations';
export * from './Pseudorandom_Functions';

export { GOAT_DATA as ANIMAL_GOAT_DATA } from './Animal/Goat';
export { default as RIDER_DATA } from './Rider';
export { default as ACCESSIBILITY_DATA } from './Accessibility';
export { default as VISUALS_DATA } from './Visuals/Animations';
export { PSEUDORANDOM_FUNCTIONS_DATA as PSEUDORANDOM_DATA } from './Pseudorandom_Functions';
