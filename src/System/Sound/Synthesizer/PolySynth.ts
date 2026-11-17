
export class Voice {
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode;
  private active: boolean = false;
  private releaseTimer: any = null;
  private currentDestination: AudioNode | null = null;

  constructor(private ctx: AudioContext) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(ctx.destination);
    this.currentDestination = ctx.destination;
  }

  setDestination(node: AudioNode) {
    this.gain.disconnect();
    this.gain.connect(node);
    this.currentDestination = node;
  }

  play(freq: number, type: OscillatorType = 'sine', duration: number = 0.5, volume: number = 0.7) {
    const now = this.ctx.currentTime;
    
    if (this.releaseTimer) {
      clearTimeout(this.releaseTimer);
    }
    
    if (this.oscillator) {
      try {
        this.oscillator.stop(now);
      } catch (e) {}
      this.oscillator.disconnect();
    }

    // Spin up oscillator on demand
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = type;
    this.oscillator.frequency.setValueAtTime(freq, now);
    this.oscillator.connect(this.gain);

    this.gain.gain.cancelScheduledValues(now);
    // Smooth fade-in and smooth envelope release
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    this.gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    this.oscillator.start(now);
    this.oscillator.stop(now + duration);

    this.active = true;
    this.releaseTimer = setTimeout(() => { 
      this.active = false;
      this.releaseTimer = null;
      if (this.oscillator) {
        try {
          this.oscillator.disconnect();
        } catch (e) {}
        this.oscillator = null;
      }
    }, duration * 1000);
  }

  isAvailable() {
    return !this.active;
  }
}

export class PolySynth {
  private voices: Voice[] = [];
  private ctx: AudioContext;

  constructor(ctx: AudioContext, private maxVoices: number = 32) {
    this.ctx = ctx;
    for (let i = 0; i < this.maxVoices; i++) {
      this.voices.push(new Voice(ctx));
    }
  }

  playNote(freq: number, type: OscillatorType = 'sine', duration: number = 1.0, volume: number = 0.7) {
    let voice = this.voices.find(v => v.isAvailable());
    if (!voice) {
       // Voice stealing
       voice = this.voices[0];
       this.voices.push(this.voices.shift()!);
    }
    if (voice) {
      voice.play(freq, type, duration, volume);
    }
  }

  setDestination(node: AudioNode) {
    this.voices.forEach(v => v.setDestination(node));
  }
}
