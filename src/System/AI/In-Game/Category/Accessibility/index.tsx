/**
 * Accessibility AI Subsystem Entry Point
 * System/AI/In-Game/Category/Accessibility/index.tsx
 *
 * Coordinates non-visual spatial acoustics, dynamic screen reader synthesis,
 * discrete announcement rate-limiting, and environmental state querying.
 */

import {
  NARRATIONS_DATA,
  generateObstacleNarration,
  generateOpponentNarration,
  generateScoreNarration,
  generateCourseStatusNarration,
  generateAheadHazardsNarration,
  generateWeatherKineticsNarration,
  calculateLanePan
} from './Narrations';
import {
  PLACES_DATA,
  resolveBiomeForLevel,
  generateEnvironmentNarration
} from './Narrations/Places';

export interface AccessibilityTelemetryState {
  level: number;
  progressFraction: number;
  z: number;
  playerLane: number;
  speed: number;
  score: number;
  riderWeightKg: number;
  goatGallopRateHz: number;
  nearestObstacle: {
    type: string;
    distance: number;
    lane: number;
  } | null;
  opponents: Array<{
    name: string;
    distanceDelta: number;
    lane: number;
    isDrafting: boolean;
  }>;
}

export class AccessibilityEngine {
  private lastAnnouncedScore: number = 0;
  private speechQueue: string[] = [];
  private lastSpeechTimestamp: number = 0;
  private minimumSpeechIntervalMs: number = 320;

  /**
   * On-demand handler for Key 'B': Biome & Place Environment
   */
  public handleKeyB(state: AccessibilityTelemetryState): string {
    return generateEnvironmentNarration(state.level, state.progressFraction, state.z);
  }

  /**
   * On-demand handler for Key 'A': Altitude & Forward Hazards
   */
  public handleKeyA(state: AccessibilityTelemetryState): string {
    return generateAheadHazardsNarration(
      state.z,
      state.nearestObstacle ? state.nearestObstacle.distance : null,
      state.nearestObstacle ? state.nearestObstacle.type : null
    );
  }

  /**
   * On-demand handler for Key 'W': Weather, Wind, and Coupling Kinetics
   */
  public handleKeyW(state: AccessibilityTelemetryState): string {
    return generateWeatherKineticsNarration(state.level, state.riderWeightKg, state.goatGallopRateHz);
  }

  /**
   * On-demand handler for Key 'C': Clock, Velocity, Progress, and Score
   */
  public handleKeyC(state: AccessibilityTelemetryState): string {
    return generateCourseStatusNarration(state.level, state.progressFraction, state.speed, state.score);
  }

  /**
   * On-demand handler for Key 'O': Opponent Proximity Scan
   */
  public handleKeyO(state: AccessibilityTelemetryState): string {
    if (!state.opponents || state.opponents.length === 0) {
      return 'No opponents in immediate sensor range.';
    }
    const closest = state.opponents.reduce((prev, curr) =>
      Math.abs(curr.distanceDelta) < Math.abs(prev.distanceDelta) ? curr : prev
    );
    return generateOpponentNarration({
      name: closest.name,
      distanceDeltaMeters: closest.distanceDelta,
      opponentLane: closest.lane,
      playerLane: state.playerLane,
      isDrafting: closest.isDrafting
    });
  }

  /**
   * Check for score gain announcement
   */
  public checkScoreAnnouncement(currentScore: number): string | null {
    if (currentScore > this.lastAnnouncedScore) {
      const delta = currentScore - this.lastAnnouncedScore;
      this.lastAnnouncedScore = currentScore;
      return generateScoreNarration(delta, currentScore);
    }
    return null;
  }
}

export const ACCESSIBILITY_DATA = {
  AccessibilityEngine,
  NARRATIONS: NARRATIONS_DATA,
  PLACES: PLACES_DATA,
  generateObstacleNarration,
  generateOpponentNarration,
  generateScoreNarration,
  generateCourseStatusNarration,
  generateAheadHazardsNarration,
  generateWeatherKineticsNarration,
  generateEnvironmentNarration,
  resolveBiomeForLevel,
  calculateLanePan
};

export * from './Narrations';
export * from './Narrations/Places';

export default ACCESSIBILITY_DATA;
