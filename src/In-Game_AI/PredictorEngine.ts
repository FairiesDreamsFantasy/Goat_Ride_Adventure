/**
 * In-Game AI Machine Learning Engine (Lightweight Online Classifier & Predictor)
 * Analyzes real-time player telemetry to update behavioral models.
 * Calculates lane preference histograms, reaction distance regressions, and speed profiles.
 * Opponents align their weight vectors to match or counter player behaviors.
 */

export interface PlayerFeatures {
  laneChoices: number[]; // Historgrams of lanes visited
  reactionDistances: number[]; // List of distances at which player jumped
  speeds: number[]; // Velocity values
  totalJumps: number;
  totalCrashes: number;
}

export interface AIRuntimeState {
  playerPreferredLane: number;
  averageReactionDistance: number;
  playerStyle: 'aggressive' | 'steady' | 'cautious';
  cooperationFactor: number; // Opponent grouping level
}

export class PredictorEngine {
  private static features: PlayerFeatures = {
    laneChoices: new Array(8).fill(0), // 8 lanes
    reactionDistances: [],
    speeds: [],
    totalJumps: 0,
    totalCrashes: 0
  };

  /**
   * Logs a lane choice action from the player and updates the histogram
   * @param lane (from -4 to 3)
   */
  static recordLane(lane: number) {
    const idx = Math.min(7, Math.max(0, lane + 4));
    this.features.laneChoices[idx]++;
  }

  /**
   * Logs speed values to track long-term rider profile
   */
  static recordSpeed(speed: number) {
    this.features.speeds.push(speed);
    if (this.features.speeds.length > 200) {
      this.features.speeds.shift();
    }
  }

  /**
   * Records reaction distance (z distance to upcoming obstacle when jump was initiated)
   */
  static recordJump(dist: number) {
    this.features.totalJumps++;
    if (dist > 50 && dist < 1000) {
      this.features.reactionDistances.push(dist);
      if (this.features.reactionDistances.length > 50) {
        this.features.reactionDistances.shift();
      }
    }
  }

  /**
   * Records standard foul event to compute performance model
   */
  static recordCrash() {
    this.features.totalCrashes++;
  }

  /**
   * Computes the trained weight vectors and returns model parameters
   */
  static getModel(): AIRuntimeState {
    // 1. Preferred Lane Classifier (Max likelihood from histogram)
    let maxIdx = 0;
    let maxVal = -1;
    for (let i = 0; i < 8; i++) {
      if (this.features.laneChoices[i] > maxVal) {
        maxVal = this.features.laneChoices[i];
        maxIdx = i;
      }
    }
    const playerPreferredLane = maxIdx - 4;

    // 2. Linear Reaction regression (Simple aggregate mean)
    const subDistances = this.features.reactionDistances;
    const averageReactionDistance = subDistances.length > 0 
      ? subDistances.reduce((a, b) => a + b, 0) / subDistances.length
      : 280; // Default sensible reaction

    // 3. Dynamic Velocity Classifier
    const spds = this.features.speeds;
    const avgSpeed = spds.length > 0 ? spds.reduce((a, b) => a + b, 0) / spds.length : 5.0;
    
    let playerStyle: 'aggressive' | 'steady' | 'cautious' = 'steady';
    if (avgSpeed > 7.0) playerStyle = 'aggressive';
    else if (avgSpeed < 4.0) playerStyle = 'cautious';

    // 4. Cooperation/Align factor based on crash-to-jump ratio
    const jumps = Math.max(1, this.features.totalJumps);
    const crashRatio = this.features.totalCrashes / jumps;
    
    // Low crash ratio trains opponents to bundle closer to the player's level
    const cooperationFactor = Math.max(0.1, Math.min(1.0, 1.0 - crashRatio));

    return {
      playerPreferredLane,
      averageReactionDistance,
      playerStyle,
      cooperationFactor
    };
  }
}
