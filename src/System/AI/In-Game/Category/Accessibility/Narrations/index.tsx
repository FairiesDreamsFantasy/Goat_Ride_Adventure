/**
 * In-Game Accessibility Narrations Engine
 * Replaces hardcoded string templates with procedural math-driven announcements.
 * Integrates spatial sound descriptors and enforces discrete accessibility announcements.
 */

import { PLACES_DATA, resolveBiomeForLevel, generateEnvironmentNarration } from './Places';

export interface SpatialAudioCue {
  pan: number; // -1.0 (far left) to +1.0 (far right)
  volume: number; // 0.0 to 1.0
  pitchShiftHz: number;
  speechText: string;
}

export interface DynamicObstacleNarrationParams {
  type: string;
  distanceMeters: number;
  obstacleLane: number;
  playerLane: number;
  speed: number;
}

export interface DynamicOpponentNarrationParams {
  name: string;
  distanceDeltaMeters: number; // positive = ahead, negative = behind
  opponentLane: number;
  playerLane: number;
  isDrafting: boolean;
}

/**
 * Calculates binaural pan based on 8-lane corridor [-4, 3]
 */
export function calculateLanePan(targetLane: number, referenceLane: number = 0): number {
  const laneDiff = targetLane - referenceLane;
  // Normalized across 8 lanes (-4 to +3)
  const clampedDiff = Math.max(-4, Math.min(3, laneDiff));
  return clampedDiff / 4.0;
}

/**
 * Generates procedural obstacle approach narration.
 */
export function generateObstacleNarration(params: DynamicObstacleNarrationParams): SpatialAudioCue {
  const { type, distanceMeters, obstacleLane, playerLane, speed } = params;
  const pan = calculateLanePan(obstacleLane, playerLane);
  const timeToImpactSec = speed > 0.01 ? (distanceMeters / speed) : 999;
  
  const lanePositionText = obstacleLane === playerLane
    ? 'in your lane'
    : obstacleLane < playerLane
      ? `${playerLane - obstacleLane} lane${playerLane - obstacleLane > 1 ? 's' : ''} to your left`
      : `${obstacleLane - playerLane} lane${obstacleLane - playerLane > 1 ? 's' : ''} to your right`;
  
  const urgency = timeToImpactSec < 1.2 ? 'Warning! ' : '';
  const speechText = `${urgency}${type.replace('_', ' ')} ${Math.round(distanceMeters)} meters ahead ${lanePositionText}.`;
  
  const volume = Math.max(0.1, Math.min(1.0, 1.0 - (distanceMeters / 60.0)));
  const pitchShiftHz = Math.max(180, Math.min(480, 400 - (distanceMeters * 3.5)));

  return { pan, volume, pitchShiftHz, speechText };
}

/**
 * Generates procedural opponent position announcement (triggered on "O" key).
 */
export function generateOpponentNarration(params: DynamicOpponentNarrationParams): string {
  const { name, distanceDeltaMeters, opponentLane, playerLane, isDrafting } = params;
  const relDist = Math.abs(Math.round(distanceDeltaMeters));
  const relPos = distanceDeltaMeters >= 0 ? `${relDist} meters ahead` : `${relDist} meters behind`;
  
  const laneDesc = opponentLane === playerLane
    ? 'in your lane'
    : opponentLane < playerLane
      ? `in lane ${opponentLane} (${playerLane - opponentLane} left)`
      : `in lane ${opponentLane} (${opponentLane - playerLane} right)`;

  const draftSuffix = isDrafting ? ' Drafting in slipstream!' : '';
  return `Opponent ${name} is ${relPos} ${laneDesc}.${draftSuffix}`;
}

/**
 * Generates score clearance announcement (e.g. "[10] points" immediately upon clearing).
 */
export function generateScoreNarration(pointsGained: number, totalScore: number): string {
  return `[${pointsGained}] points. Total score ${totalScore}.`;
}

/**
 * Generates procedural course status narration (bound to "C" key).
 */
export function generateCourseStatusNarration(level: number, progressFraction: number, speedMps: number, score: number): string {
  const pct = Math.round(progressFraction * 100);
  const speedKmh = Math.round(speedMps * 3.6);
  return `Level ${level}. Progress ${pct} percent. Gallop velocity ${speedKmh} kilometers per hour. Current score ${score}.`;
}

/**
 * Generates procedural altitude & forward hazards narration (bound to "A" key).
 */
export function generateAheadHazardsNarration(z: number, nearestObstacleDist: number | null, nearestObstacleType: string | null): string {
  const elevation = Math.round(150 + Math.sin(z * 0.005) * 85);
  if (nearestObstacleDist !== null && nearestObstacleType) {
    return `Elevation ${elevation} meters. Forward hazard: ${nearestObstacleType.replace('_', ' ')} detected at ${Math.round(nearestObstacleDist)} meters.`;
  }
  return `Elevation ${elevation} meters. Forward track clear for 60 meters.`;
}

/**
 * Generates procedural weather & kinetics narration (bound to "W" key).
 */
export function generateWeatherKineticsNarration(level: number, riderWeightKg: number, goatGallopRateHz: number): string {
  const biome = resolveBiomeForLevel(level);
  const windMps = (12.0 + Math.sin(level * 0.8) * 8.0).toFixed(1);
  return `${biome.biomeName} atmospheric conditions: crosswind ${windMps} meters per second. Coupling load: ${riderWeightKg.toFixed(0)} kg rider, cadence ${goatGallopRateHz.toFixed(1)} strides per second.`;
}

export const NARRATIONS_DATA = {
  calculateLanePan,
  generateObstacleNarration,
  generateOpponentNarration,
  generateScoreNarration,
  generateCourseStatusNarration,
  generateAheadHazardsNarration,
  generateWeatherKineticsNarration,
  PLACES: PLACES_DATA,
  resolveBiomeForLevel,
  generateEnvironmentNarration
};

export default NARRATIONS_DATA;
