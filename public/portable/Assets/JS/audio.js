let audioCtx = null;
let masterGain = null;
let reverbNode = null;
let reverbGain = null;
let bgmSynth = null;
let sfxSynth = null;
let currentEnv = 'farm';

class Voice {
    constructor(ctx, target) {
        this.ctx = ctx;
        this.oscillator = null;
        this.gain = ctx.createGain();
        this.gain.gain.value = 0;
        this.gain.connect(target);
        this.active = false;
        this.releaseTimer = null;
        this.target = target;
    }

    setDestination(node) {
        this.gain.disconnect();
        this.gain.connect(node);
        this.target = node;
    }

    play(freq, type = 'sine', duration = 0.5, volume = 0.7) {
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

class PolySynth {
    constructor(ctx, maxVoices = 32, target) {
        this.ctx = ctx;
        this.maxVoices = maxVoices;
        this.voices = [];
        for (let i = 0; i < maxVoices; i++) {
            this.voices.push(new Voice(ctx, target));
        }
    }

    playNote(freq, type = 'sine', duration = 1.0, volume = 0.7) {
        let voice = this.voices.find(v => v.isAvailable());
        if (!voice) {
            // Voice stealing
            voice = this.voices[0];
            this.voices.push(this.voices.shift());
        }
        if (voice) {
            voice.play(freq, type, duration, volume);
        }
    }

    setDestination(node) {
        this.voices.forEach(v => v.setDestination(node));
    }
}

export function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    
    // Create Polyphonic Synths
    bgmSynth = new PolySynth(audioCtx, 24, masterGain);
    sfxSynth = new PolySynth(audioCtx, 16, masterGain);
    
    setupReverb('farm');
    console.log("Audio Engine Ready with Dynamic On-Demand Voices");
}

function setupReverb(env) {
    if(!audioCtx) return;
    currentEnv = env;
    if(!reverbNode) {
        reverbNode = audioCtx.createDelay(1.0);
        reverbGain = audioCtx.createGain();
        reverbNode.connect(reverbGain);
        reverbGain.connect(masterGain);
        
        const feedback = audioCtx.createGain();
        feedback.gain.value = 0.4;
        reverbNode.connect(feedback);
        feedback.connect(reverbNode);
    }
    let amt = 0, dt = 0.1;
    if (env === 'cave') { amt = 0.5; dt = 0.35; }
    else if (env === 'jungle') { amt = 0.25; dt = 0.18; }
    else if (env === 'mountain') { amt = 0.3; dt = 0.45; }
    else if (env === 'city') { amt = 0.2; dt = 0.12; }
    else if (env === 'farm') { amt = 0.1; dt = 0.08; }
    else if (env === 'ice_glacier') { amt = 0.42; dt = 0.28; }
    else if (env === 'dungeon') { amt = 0.48; dt = 0.24; }
    reverbGain.gain.setTargetAtTime(amt, audioCtx.currentTime, 0.1);
    reverbNode.delayTime.setTargetAtTime(dt, audioCtx.currentTime, 0.1);

    if (bgmSynth) {
        if (amt > 0) bgmSynth.setDestination(reverbNode);
        else bgmSynth.setDestination(masterGain);
    }
    if (sfxSynth) {
        if (amt > 0) sfxSynth.setDestination(reverbNode);
        else sfxSynth.setDestination(masterGain);
    }
}

export function setEnvAudio(env) { setupReverb(env); }

export function playClop(off, p) {
    if(!audioCtx) return;
    const env = currentEnv || 'farm';
    const now = audioCtx.currentTime;
    const t = now + off;

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

    const calibratedPitch = p * pitchMultiplier;

    // Thump
    const thump = audioCtx.createOscillator();
    const thumpGain = audioCtx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(calibratedPitch, t);
    thump.frequency.exponentialRampToValueAtTime(10, t + decay);
    thumpGain.gain.setValueAtTime(thumpVol, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + decay);
    
    thump.connect(thumpGain);
    thumpGain.connect(masterGain);
    if (reverbNode) thumpGain.connect(reverbNode);

    // Noise/Texture
    const bufferSize = audioCtx.sampleRate * 0.03;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    const noiseGain = audioCtx.createGain();
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(noiseFreq + calibratedPitch, t);
    filter.Q.setValueAtTime(noiseQ, t);
    
    noiseGain.gain.setValueAtTime(noiseVol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + Math.min(0.03, decay));
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    if (reverbNode) noiseGain.connect(reverbNode);
    
    thump.start(t);
    noiseSource.start(t);
    thump.stop(t + decay);
    noiseSource.stop(t + 0.05);
}

export function playComboSound(comboCount) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    if (comboCount <= 1) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(masterGain);
        if (reverbNode) g.connect(reverbNode);
        osc.start();
        osc.stop(now + 0.15);
    } else if (comboCount === 2) {
        [523.25, 659.25].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            const t = now + i * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, t);
            osc.frequency.exponentialRampToValueAtTime(f * 1.2, t + 0.15);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.35, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(g);
            g.connect(masterGain);
            if (reverbNode) g.connect(reverbNode);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    } else if (comboCount === 3) {
        [523.25, 659.25, 783.99].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            const t = now + i * 0.06;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.4, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(g);
            g.connect(masterGain);
            if (reverbNode) g.connect(reverbNode);
            osc.start(t);
            osc.stop(t + 0.2);
        });
    } else if (comboCount === 4) {
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        if (reverbNode) g.connect(reverbNode);
        osc.start();
        osc.stop(now + 0.25);
    } else {
        [523.25, 659.25, 783.99, 987.77, 1046.50].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            const t = now + i * 0.05;
            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.45, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(g);
            g.connect(masterGain);
            if (reverbNode) g.connect(reverbNode);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }
}

export function playJump() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Main Swoosh (Extreme Quality Sync)
    const o = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    o.type = 'sine';
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    o2.type = 'triangle';
    o2.frequency.setValueAtTime(100, now);
    o2.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    g.gain.setValueAtTime(0.7, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    o.connect(g); o2.connect(g);
    g.connect(masterGain); // Dry
    if (reverbNode) g.connect(reverbNode); // Wet
    
    o.start(); o2.start();
    o.stop(now + 0.25); o2.stop(now + 0.25);
}

export function playBleat(size) {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    
    let baseFreq = 220;
    let duration = 0.6;
    let fmRate = 15;
    let fmDepth = 0.05;

    if (size === 'small') {
        baseFreq = 420;
        duration = 0.35;
        fmRate = 22;
        fmDepth = 0.08;
    } else if (size === 'large') {
        baseFreq = 160;
        duration = 0.8;
        fmRate = 12;
        fmDepth = 0.04;
    } else if (size === 'largest') {
        baseFreq = 100;
        duration = 1.1;
        fmRate = 8;
        fmDepth = 0.03;
    }

    const createVocal = (f, v) => {
        const o = audioCtx.createOscillator();
        const fm = audioCtx.createOscillator();
        const fmGain = audioCtx.createGain();
        const g = audioCtx.createGain();
        
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, now);
        o.frequency.exponentialRampToValueAtTime(f * 0.8, now + duration * 0.8);
        
        fm.type = 'sine';
        fm.frequency.setValueAtTime(fmRate, now);
        fmGain.gain.setValueAtTime(f * fmDepth, now);
        
        fm.connect(fmGain);
        fmGain.connect(o.frequency);
        
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(v * 3, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        o.connect(g); 
        g.connect(masterGain); // Dry
        if (reverbNode) g.connect(reverbNode); // Wet        
        o.start();
        fm.start();
        o.stop(now + duration);
        fm.stop(now + duration);
    };
    createVocal(baseFreq, 0.3);
    createVocal(baseFreq * 2, 0.15);
    createVocal(baseFreq * 3, 0.1);
}

export function playAmbient(f) {
    if(!audioCtx || !bgmSynth) return;
    const freq = f || (60 + Math.random() * 140);
    bgmSynth.playNote(freq, 'sine', 6.0, 0.05);
    if (freq < 150) {
        bgmSynth.playNote(freq * 1.5, 'sine', 4.0, 0.02); // Perfect Fifth
        bgmSynth.playNote(freq * 2.0, 'sine', 3.0, 0.012);  // Octave
    }
}

let farmAmbienceGain = null;
export function startFarmAmbience() {
    if(!audioCtx) return;
    if(farmAmbienceGain) return;
    
    const bufferSize = audioCtx.sampleRate * 2.0;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(400, audioCtx.currentTime);
    
    farmAmbienceGain = audioCtx.createGain();
    farmAmbienceGain.gain.setValueAtTime(0, audioCtx.currentTime);
    farmAmbienceGain.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 2);
    
    noise.connect(lp);
    lp.connect(farmAmbienceGain);
    farmAmbienceGain.connect(masterGain);
    noise.start();
}

export function stopFarmAmbience() {
    if(farmAmbienceGain) {
        farmAmbienceGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
        const g = farmAmbienceGain;
        setTimeout(() => { if(g === farmAmbienceGain) farmAmbienceGain = null; }, 2000);
    }
}

export function playPoint() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    o.connect(g); 
    g.connect(masterGain); // Dry
    if (reverbNode) g.connect(reverbNode); // Wet
    o.start(); o.stop(now + 0.2);
}

export function playLevelUp() {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const t = now + (i * 0.1);
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.45, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.connect(g); 
        g.connect(masterGain); // Dry
        if (reverbNode) g.connect(reverbNode); // Wet
        o.start(t); o.stop(t + 0.5);
    });
}

export function playObstacleApproach(pan, dz) {
    const absDz = Math.abs(dz);
    if (!audioCtx || absDz > 1000) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    let panner;
    try {
        panner = audioCtx.createStereoPanner();
    } catch (e) {
        panner = audioCtx.createGain();
    }
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    const freq = 400 - (absDz * 0.2);
    osc.frequency.setValueAtTime(freq, now);
    
    if (panner.pan) {
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
    }
    
    const vol = Math.max(0, 0.2 * (1 - absDz / 1000));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    if (panner.pan) {
        osc.connect(panner);
        panner.connect(gain);
    } else {
        osc.connect(gain);
    }
    gain.connect(masterGain);

    osc.start();
    osc.stop(now + 0.1);
}
