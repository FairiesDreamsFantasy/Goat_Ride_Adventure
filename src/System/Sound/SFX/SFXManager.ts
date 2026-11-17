
import { PolySynth } from '../Synthesizer/PolySynth';
import { AudioParams, GoatCharacteristics } from '../../Logic/types';

export class SFXManager {
  private static ctx: AudioContext | null = null;
  private static bgmSynth: PolySynth | null = null;
  private static sfxSynth: PolySynth | null = null;
  private static currentEnv: string = 'farm';
  private static noiseBufferCache: AudioBuffer | null = null;

  private static getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBufferCache) {
      const size = ctx.sampleRate * 2.0; // 2 seconds of noise
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBufferCache = buffer;
    }
    return this.noiseBufferCache;
  }

  private static masterCompressor: DynamicsCompressorNode | null = null;

  private static getCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterCompressor.connect(this.ctx.destination);
    }
    this.resumeAudio();
    return this.ctx;
  }

  public static getMasterOutput(): AudioNode {
    this.getCtx();
    return this.masterCompressor || this.ctx!.destination;
  }

  static resumeAudio() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private static getBGMSynth() {
    if (!this.bgmSynth) this.bgmSynth = new PolySynth(this.getCtx(), 24);
    if (this.reverbNode) this.bgmSynth.setDestination(this.reverbNode);
    return this.bgmSynth;
  }

  private static getSFXSynth() {
    if (!this.sfxSynth) this.sfxSynth = new PolySynth(this.getCtx(), 16);
    if (this.reverbNode) this.sfxSynth.setDestination(this.reverbNode);
    return this.sfxSynth;
  }

  private static reverbNode: DelayNode | null = null;
  private static reverbGain: GainNode | null = null;

  private static setupReverb(env: string) {
    const ctx = this.getCtx();
    if (!this.reverbNode) {
      this.reverbNode = ctx.createDelay(1.0);
      this.reverbGain = ctx.createGain();
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.getMasterOutput());
      this.reverbGain.gain.setValueAtTime(0, ctx.currentTime);
      
      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.4, ctx.currentTime);
      this.reverbNode.connect(feedback);
      feedback.connect(this.reverbNode);
    }
    
    const now = ctx.currentTime;
    let reverbAmount = 0;
    let delayTime = 0.1;
    
    if (env === 'cave') { reverbAmount = 0.5; delayTime = 0.35; }
    else if (env === 'jungle') { reverbAmount = 0.25; delayTime = 0.18; }
    else if (env === 'mountain') { reverbAmount = 0.3; delayTime = 0.45; }
    else if (env === 'city') { reverbAmount = 0.2; delayTime = 0.12; }
    else if (env === 'farm') { reverbAmount = 0.1; delayTime = 0.08; }
    else if (env === 'ice_glacier') { reverbAmount = 0.42; delayTime = 0.28; }
    else if (env === 'dungeon') { reverbAmount = 0.48; delayTime = 0.24; }

    this.reverbGain!.gain.setTargetAtTime(reverbAmount, now, 0.1);
    this.reverbNode!.delayTime.setTargetAtTime(delayTime, now, 0.1);
    
    if (this.bgmSynth) {
      if (reverbAmount > 0) this.bgmSynth.setDestination(this.reverbNode!);
      else this.bgmSynth.setDestination(this.getMasterOutput());
    }
    if (this.sfxSynth) {
      if (reverbAmount > 0) this.sfxSynth.setDestination(this.reverbNode!);
      else this.sfxSynth.setDestination(this.getMasterOutput());
    }
  }

  static playBleat(goatInfo?: string | GoatCharacteristics) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    // Default Fallback Specs
    let specs: AudioParams = {
      baseFreq: 220,
      duration: 0.6,
      fmRate: 15,
      fmDepth: 0.05,
      oscType: 'sawtooth',
      pitchSweepRatio: 0.8
    };

    if (goatInfo && typeof goatInfo === 'object' && goatInfo.audio) {
      specs = { ...specs, ...goatInfo.audio };
    } else if (typeof goatInfo === 'string') {
      if (goatInfo === 'small') specs = { ...specs, baseFreq: 420, duration: 0.35, fmRate: 22, fmDepth: 0.08 };
      else if (goatInfo === 'large') specs = { ...specs, baseFreq: 160, duration: 0.8, fmRate: 12, fmDepth: 0.04 };
      else if (goatInfo === 'largest') specs = { ...specs, baseFreq: 100, duration: 1.1, fmRate: 8, fmDepth: 0.03 };
    }

    const {
      baseFreq, duration, fmRate, fmDepth, oscType,
      filterFreq, filterType, filterQ = 5,
      secondOscType, secondOscFreqRatio = 2.0,
      pitchSweepRatio = 0.8
    } = specs;

    // Vocal Cord FM Emulation (Scientific Quality)
    const createVocalCord = (freq: number, volume: number, type: OscillatorType) => {
      const osc = ctx.createOscillator();
      const fm = ctx.createOscillator();
      const fmGain = ctx.createGain();
      const g = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * pitchSweepRatio, now + duration * 0.8);
      
      fm.type = 'sine';
      fm.frequency.setValueAtTime(fmRate, now);
      fmGain.gain.setValueAtTime(freq * fmDepth, now);
      
      fm.connect(fmGain);
      fmGain.connect(osc.frequency);
      
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(volume, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      if (filterFreq && filterType) {
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(filterFreq, now);
        filter.Q.setValueAtTime(filterQ, now);
        osc.connect(filter);
        filter.connect(g);
      } else {
        osc.connect(g);
      }
      
      g.connect(ctx.destination);
      if (this.reverbNode) g.connect(this.reverbNode);
      
      osc.start();
      fm.start();
      osc.stop(now + duration);
      fm.stop(now + duration);
    };

    // Synthesize the fundamental and harmonic layers
    createVocalCord(baseFreq, 0.7, oscType);
    createVocalCord(baseFreq * 2, 0.35, oscType);
    createVocalCord(baseFreq * 3, 0.18, oscType);

    // Play optional secondary audio layer for unique texture complexity
    if (secondOscType) {
      createVocalCord(baseFreq * secondOscFreqRatio, 0.3, secondOscType);
    }
  }

  static setEnvironment(env: string) {
    this.currentEnv = env;
    this.setupReverb(env);
  }

  static playFoul() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  static playJump() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    // Main Swoosh (Dual Oscillators for Cinematic Depth)
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator(); 
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(100, now);
    osc2.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination); 
    if (this.reverbNode) gain.connect(this.reverbNode); 
    
    osc.start();
    osc2.start();
    osc.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  static playObstacleApproach(pan: number, dz: number) {
    const absDz = Math.abs(dz);
    if (absDz > 1000) return;
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency ascends as absDz approaches 0 (400Hz at center, 200Hz at 1000m)
    const freq = 400 - (absDz * 0.2);
    osc.frequency.setValueAtTime(freq, now);
    
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
    
    const vol = Math.max(0, 0.2 * (1 - absDz / 1000));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.1);
  }

  static playAmbient(freq: number) {
    const synth = this.getBGMSynth();
    // Complex additive synthesis for rich ambient textures
    synth.playNote(freq, 'sine', 6.0, 0.05);
    if (freq < 150) {
      synth.playNote(freq * 1.5, 'sine', 4.0, 0.02); // Perfect Fifth
      synth.playNote(freq * 2.0, 'sine', 3.0, 0.012);  // Octave
    }
  }

  static playFarmBlendedAmbience() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    // Low-pass filtered noise for "wind/rustle"
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);
    noise.loop = true;
    
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(400, now);
    
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.015, now + 2);
    
    noise.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    
    noise.start();
    // Wrap noise source so it can be stopped
    return { gain: g, source: noise };
  }

  static playClop(offset: number, pitch: number) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const t = now + offset;
    const env = this.currentEnv || 'farm';

    // Surface Physics Engine Calibration
    let pitchMultiplier = 1.0;
    let noiseFreq = 500;
    let noiseQ = 6;
    let noiseVol = 0.5;
    let thumpVol = 0.8;
    let decay = 0.08;

    if (env === 'farm' || env === 'europe' || env === 'australia' || env === 'montana') {
      pitchMultiplier = 1.0;
      noiseFreq = 500;
      noiseQ = 6;
      noiseVol = 0.5;
      thumpVol = 0.8;
      decay = 0.08;
    } else if (env === 'jungle' || env === 'vietnam' || env === 'thailand' || env === 'philippines' || env === 'ghost_grove') {
      pitchMultiplier = 0.9;
      noiseFreq = 900;
      noiseQ = 4;
      noiseVol = 0.7;
      thumpVol = 0.5;
      decay = 0.07;
    } else if (env === 'desert' || env === 'argentina') {
      pitchMultiplier = 0.82;
      noiseFreq = 250;
      noiseQ = 8;
      noiseVol = 0.4;
      thumpVol = 0.6;
      decay = 0.11;
    } else if (env === 'city' || env === 'cyber_city') {
      pitchMultiplier = 1.25;
      noiseFreq = 1300;
      noiseQ = 12;
      noiseVol = 0.8;
      thumpVol = 0.95;
      decay = 0.06;
    } else if (env === 'mountain' || env === 'pixel_peaks' || env === 'china' || env === 'new_zealand') {
      pitchMultiplier = 1.15;
      noiseFreq = 750;
      noiseQ = 10;
      noiseVol = 0.6;
      thumpVol = 0.85;
      decay = 0.09;
    } else if (env === 'cave' || env === 'crystal_canyon' || env === 'lava_lake' || env === 'steam_station') {
      pitchMultiplier = 1.05;
      noiseFreq = 450;
      noiseQ = 7;
      noiseVol = 0.5;
      thumpVol = 0.8;
      decay = 0.12;
    } else if (env === 'nebula_plains' || env === 'glitch_glade') {
      pitchMultiplier = 1.4;
      noiseFreq = 1800;
      noiseQ = 15;
      noiseVol = 0.85;
      thumpVol = 0.5;
      decay = 0.05;
    } else if (env === 'ice_glacier') {
      pitchMultiplier = 1.1;
      noiseFreq = 650;
      noiseQ = 8;
      noiseVol = 0.65;
      thumpVol = 0.75;
      decay = 0.10;
    } else if (env === 'dungeon') {
      pitchMultiplier = 1.25;
      noiseFreq = 1100;
      noiseQ = 11;
      noiseVol = 0.75;
      thumpVol = 0.90;
      decay = 0.07;
    }

    const calibratedPitch = pitch * pitchMultiplier;

    // Thump
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(calibratedPitch, t);
    thump.frequency.exponentialRampToValueAtTime(10, t + decay);
    thumpGain.gain.setValueAtTime(thumpVol, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + decay);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    if (this.reverbNode) thumpGain.connect(this.reverbNode);
    
    // Noise/Texture
    const noiseBuffer = this.getNoiseBuffer(ctx);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(noiseFreq + calibratedPitch, t);
    filter.Q.setValueAtTime(noiseQ, t);
    gain.gain.setValueAtTime(noiseVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + Math.min(0.03, decay));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    if (this.reverbNode) gain.connect(this.reverbNode);
    
    thump.start(t);
    // Start with a randomized offset within our 2-second pre-allocated noise buffer for organic acoustics
    noise.start(t, Math.random() * 1.8);
    thump.stop(t + decay);
    noise.stop(t + 0.05);
  }

  static playComboSound(comboCount: number) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    if (comboCount <= 1) {
      // Combo 1: Standard clean high chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (this.reverbNode) gain.connect(this.reverbNode);
      osc.start();
      osc.stop(now + 0.15);
    } else if (comboCount === 2) {
      // Combo 2: Double Major Third Upward Ascent
      [523.25, 659.25].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 1.2, t + 0.15);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } else if (comboCount === 3) {
      // Combo 3: Perfect Triplet Arpeggio Fanfare
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } else if (comboCount === 4) {
      // Combo 4: Rapid Resonant Wave Sweep
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      if (this.reverbNode) gain.connect(this.reverbNode);
      osc.start();
      osc.stop(now + 0.25);
    } else {
      // Combo 5+: Major Seventh Triumphant Sparkle with spatial panning
      [523.25, 659.25, 783.99, 987.77, 1046.50].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner();
        const gain = ctx.createGain();
        const t = now + i * 0.05;
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, t);
        panner.pan.setValueAtTime(-0.5 + (i * 0.25), t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.45, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(panner);
        panner.connect(gain);
        gain.connect(ctx.destination);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    }
  }

  static playGallop(speed: number) {
    if (speed < 0.1) return;
    
    // Dual-clop pattern for equine realism (clop-clop)
    this.playClop(0, 80);
    this.playClop(0.08, 90); 
  }

  static playLevelUp() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const time = now + (i * 0.1);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.85, time + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      
      osc.connect(g);
      g.connect(ctx.destination);
      if (this.reverbNode) g.connect(this.reverbNode);
      
      osc.start(time);
      osc.stop(time + 0.5);
    });
  }

  static playPoint() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }
}
