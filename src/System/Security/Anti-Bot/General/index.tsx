/**
 * System Security - Anti-Bot General Subsystem
 * High-precision scraper detection, automated bot mitigation,
 * rate limiting, and behavioral entropy verification.
 */

export interface AntiBotChallenge {
  id: string;
  timestamp: number;
  entropyScore: number;
  isHuman: boolean;
  botProbability: number;
}

export interface SecurityEventLog {
  timestamp: number;
  action: 'ALLOWED' | 'FLAGGED' | 'BLOCKED';
  reason: string;
  ipHash?: string;
  userAgentSnippet?: string;
}

export class AntiBotDetector {
  private static instance: AntiBotDetector;
  private requestTimestamps: number[] = [];
  private inputEventsIntervals: number[] = [];
  private lastInputTime: number = 0;
  private maxRequestsPerMinute: number = 120;
  private securityLogs: SecurityEventLog[] = [];

  public static getInstance(): AntiBotDetector {
    if (!AntiBotDetector.instance) {
      AntiBotDetector.instance = new AntiBotDetector();
    }
    return AntiBotDetector.instance;
  }

  /**
   * Records user interaction input (keystroke/click/touch) to analyze human entropy
   */
  public registerHumanInteraction(): void {
    const now = performance.now();
    if (this.lastInputTime > 0) {
      const interval = now - this.lastInputTime;
      this.inputEventsIntervals.push(interval);
      if (this.inputEventsIntervals.length > 50) {
        this.inputEventsIntervals.shift();
      }
    }
    this.lastInputTime = now;
  }

  /**
   * Calculates variance in input timing. Standard bots emit uniform 0ms or fixed-interval events.
   */
  public calculateHumanEntropy(): number {
    if (this.inputEventsIntervals.length < 5) return 1.0; // Assume human until enough data
    const mean = this.inputEventsIntervals.reduce((a, b) => a + b, 0) / this.inputEventsIntervals.length;
    const variance = this.inputEventsIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.inputEventsIntervals.length;
    const stdDev = Math.sqrt(variance);

    // Highly rigid standard deviation (< 2.0ms) indicates synthetic automated script execution
    return stdDev;
  }

  /**
   * Evaluates incoming game state request for bot or scraper signature
   */
  public evaluateRequest(): AntiBotChallenge {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);

    const entropy = this.calculateHumanEntropy();
    const rateOverloaded = this.requestTimestamps.length > this.maxRequestsPerMinute;
    const isSyntheticSpeed = entropy < 1.5 && this.inputEventsIntervals.length >= 10;

    let botProb = 0;
    if (rateOverloaded) botProb += 0.6;
    if (isSyntheticSpeed) botProb += 0.4;

    const isHuman = botProb < 0.5;

    const logEntry: SecurityEventLog = {
      timestamp: now,
      action: isHuman ? 'ALLOWED' : (botProb > 0.8 ? 'BLOCKED' : 'FLAGGED'),
      reason: rateOverloaded ? 'Rate limit exceeded' : (isSyntheticSpeed ? 'Synthetic input timing detected' : 'Normal execution')
    };

    this.securityLogs.push(logEntry);
    if (this.securityLogs.length > 100) this.securityLogs.shift();

    return {
      id: `ab_${now}_${Math.floor(Math.random() * 10000)}`,
      timestamp: now,
      entropyScore: entropy,
      isHuman,
      botProbability: botProb
    };
  }

  public getLogs(): SecurityEventLog[] {
    return this.securityLogs;
  }
}
