import { RefObject, useEffect, useRef, useState } from 'react';
import { GameEnvironment, GameStateStatus, GoatCharacteristics, Obstacle, PlayerState, ComputerOpponent, TreatItem } from './types';
import { renderFrame } from '../Visuals/Renderer';
import { speak } from '../Sound/TTS/TTSService';
import { SFXManager } from '../Sound/SFX/SFXManager';
import { BGMManager } from '../Sound/BGM/BGMManager';

import { ALL_GOATS } from '../../Characters/Goats';
import { RiderCharacter } from './types';
import { PredictorEngine } from '../../In-Game_AI/PredictorEngine';
import { IndexedDBStore } from './IndexedDBStore';
import { getLevelConfig, generateObstacleAtDistance, generateTreatAtDistance } from '../../World/_Wildcard_/Levels';
import { computeOpponentDecision } from '../AI/In-Game/Category/Pseudorandom_Functions';

const INITIAL_PLAYER: PlayerState = {
  x: 0,
  y: 0,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  rotation: 0,
  speed: 0,
  targetSpeed: 0,
  isJumping: false,
  cruiseControl: false,
  characteristics: ALL_GOATS['white_standard'],
};

export function useGameEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>, 
  goatId: string, 
  selectedRider: RiderCharacter | null = null,
  pausedOutside: boolean = false
) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0n);
  const [topScore, setTopScore] = useState(200000n);
  const [player, setPlayer] = useState<PlayerState>({
    ...INITIAL_PLAYER,
    characteristics: ALL_GOATS[goatId] || ALL_GOATS['white_standard']
  });
  const [status, setStatus] = useState<GameStateStatus>(GameStateStatus.PLAYING);
  const [isPaused, setIsPaused] = useState(false);

  // Use Refs for simulation state to avoid stale closures in the game loop
  const playerRef = useRef<PlayerState & { rider?: RiderCharacter | null }>({
    ...INITIAL_PLAYER,
    characteristics: ALL_GOATS[goatId] || ALL_GOATS['white_standard'],
    rider: selectedRider
  });
  const isPausedRef = useRef(false);
  const welcomeActiveRef = useRef(true); // Always starts true for the welcome description
  const levelRef = useRef(1);
  const scoreRef = useRef(0n);
  const requestRef = useRef<number>(null);
  const keys = useRef<Set<string>>(new Set());
  const distanceRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const treatsRef = useRef<TreatItem[]>([]);
  const lastSpawnRef = useRef(0);
  const lastTreatSpawnRef = useRef(0);
  const frameRef = useRef(0);
  const comboCountRef = useRef(0);
  const layoutRef = useRef<'primary' | 'secondary'>('primary');
  const farmAmbienceRef = useRef<{ gain: GainNode, source: AudioBufferSourceNode } | null>(null);
  const opponentsRef = useRef<ComputerOpponent[]>([]);

  // Initialize the 7 unique Computer Opponents with zero overhead
  if (opponentsRef.current.length === 0) {
    opponentsRef.current = [
      {
        id: 'opp_pip',
        name: 'Pip',
        x: -300,
        y: 0,
        z: 300,
        speed: 1.8,
        color: '#AB47BC', // Lavender Violet
        size: 'small',
        targetLane: -3,
        isJumping: false,
        vy: 0,
        reactionTime: 35,
        style: 'cautious'
      },
      {
        id: 'opp_gideon',
        name: 'Gideon',
        x: -200,
        y: 0,
        z: 350,
        speed: 1.9,
        color: '#EF5350', // Crimson Red
        size: 'large',
        targetLane: -2,
        isJumping: false,
        vy: 0,
        reactionTime: 35,
        style: 'cautious'
      },
      {
        id: 'opp_clover',
        name: 'Clover',
        x: -100,
        y: 0,
        z: 450,
        speed: 2.1,
        color: '#66BB6A', // Emerald Green
        size: 'small',
        targetLane: -1,
        isJumping: false,
        vy: 0,
        reactionTime: 20,
        style: 'aggressive'
      },
      {
        id: 'opp_abigay_jr',
        name: 'Abigay Jr.',
        x: 0,
        y: 0,
        z: 400,
        speed: 2.0,
        color: '#42A5F5', // Sky Blue
        size: 'large',
        targetLane: 0,
        isJumping: false,
        vy: 0,
        reactionTime: 25,
        style: 'steady'
      },
      {
        id: 'opp_luna_bear',
        name: 'Luna Bear',
        x: 100,
        y: 0,
        z: 250,
        speed: 2.0,
        color: '#EC407A', // Rose Pink
        size: 'largest',
        targetLane: 1,
        isJumping: false,
        vy: 0,
        reactionTime: 25,
        style: 'steady'
      },
      {
        id: 'opp_buster',
        name: 'Buster',
        x: 200,
        y: 0,
        z: 150,
        speed: 2.3,
        color: '#26A69A', // Vibrant Teal
        size: 'small',
        targetLane: 2,
        isJumping: false,
        vy: 0,
        reactionTime: 40,
        style: 'aggressive'
      },
      {
        id: 'opp_barnaby',
        name: 'Barnaby',
        x: 300,
        y: 0,
        z: 200,
        speed: 2.2,
        color: '#FFB74D', // Amber Warm Orange
        size: 'largest',
        targetLane: 3,
        isJumping: false,
        vy: 0,
        reactionTime: 50,
        style: 'aggressive'
      }
    ];
  }

  // Goat Physics and Visual Modifiers
  const getGoatData = () => {
    const data = ALL_GOATS[goatId] || ALL_GOATS['white_standard'];
    let speedMod = 1;
    let jumpMod = 1;
    
    if (data.size === 'small') { speedMod = 1.2; jumpMod = 0.9; }
    else if (data.size === 'large') { speedMod = 0.8; jumpMod = 1.3; }
    else if (data.size === 'largest') { speedMod = 0.5; jumpMod = 0.7; }
    else if (data.size === 'giant') { speedMod = 0.4; jumpMod = 1.5; }

    return { mods: { speed: speedMod, jump: jumpMod }, char: data };
  };

  const { mods, char } = getGoatData();

  useEffect(() => {
    playerRef.current.characteristics = char;
    playerRef.current.rider = selectedRider;
    setPlayer({ ...playerRef.current });
  }, [goatId, selectedRider, char]);

  useEffect(() => {
    const env = getEnvironment(levelRef.current);
    welcomeActiveRef.current = true;

    // Rich immersive descriptions for all levels and environments
    const descriptions: Record<string, string> = {
      farm: "Welcome to the serene countryside pastures of the farm. Red barns, fields of clover, and rustic picket fences guide your rhythm. Take visual deep breaths, and let's gallop through the peaceful grasses.",
      jungle: "Prepare to blaze a trail through the dense wild jungle. Beware the thick canopy cover, cascading leaves, and mossy logs as you ride deep under the heavy rainforest atmosphere.",
      desert: "Facing the blistering heat of the sun-drenched canyon. Endless sand dunes stretch across this arid valley, populated by prickly cacti, sandstone formations, and parched, dusty lanes.",
      city: "Welcome to the neon-drenched metropolis under a beautiful midnight sky. Concrete asphalt, street rails, grid lines, and concrete barriers span across this bustling night-ride of the city center.",
      mountain: "Prepare to scale the high alpine ridge heights. Snowy mountain winds, sheer grey cliff-faces, and pine trees adorn this elevated trail where only the hardiest mountain goats dare steer.",
      cave: "Plunging deep into the underground abyssal caverns with zero daylight. Whispering draft sounds, magnificent stalactites, and dark basalt stones surround you. Watch the path closely.",
      nebula_plains: "Welcome to the cosmic expanse of Nebula Plains. Floating celestial stardust paths and quantum wormholes drift in the infinite violet starry space around your goat.",
      cyber_city: "Welcome to the neon cybernetic grid layout. Holographic billboards, high-frequency digital beams, and cyber lane grids guide you through this super-charged futuristic racetrack.",
      ice_glacier: "Explore the frozen monolith of the Ice Glacier region. Trot across slick icy paths, plunge into frozen cavernous caves, and climb steep snow-covered hills. Scientifically, animals trampling these deep snowy fields compress the snow pack, which dramatically increases its thermal conductivity, facilitating direct heat conduction that introduces cold ambient air deep into the underlying icy ground to keep the permafrost stable.",
      dungeon: "Brave the dark, ancient stone-forged structures of the Dungeon region. Navigate stone walls beneath mixed high and low ceilings, slide across hard stone flooring under towering vertical vent shafts in the ceiling, and trace a maze-like set of paths bridging deep and dark pits. Scientifically, running across these subterranean spaces changes acoustic reflections dramatically based on height variations and spatial volume, creating vertical pressure waves inside vent shafts and deep echoes from bottomless chambers below."
    };

    const welcomeDesc = descriptions[env] || `Welcome to the beautiful adventure in the ${env.replace(/_/g, ' ')} region. An epic ride awaits you on the back of your goat across this captivating path.`;
    
    speak(`Level ${levelRef.current} welcome announcement: ${welcomeDesc} Get ready to ride! Starting in three... two... one... go!`, () => {
      welcomeActiveRef.current = false;
    });

    BGMManager.playTheme(env as any);
    SFXManager.setEnvironment(env);
    if (levelRef.current > 1) {
      SFXManager.playLevelUp();
    }

    if (env === 'farm') {
      if (!farmAmbienceRef.current) {
        farmAmbienceRef.current = SFXManager.playFarmBlendedAmbience();
      }
    } else {
      if (farmAmbienceRef.current) {
        const { gain, source } = farmAmbienceRef.current;
        const now = gain.context.currentTime;
        gain.gain.linearRampToValueAtTime(0, now + 2);
        source.stop(now + 2);
        farmAmbienceRef.current = null;
      }
    }
    
    // Clear obstacles on level change
    obstaclesRef.current = [];
    lastSpawnRef.current = 0;

    // Calibrate computer players per level so the challenge remains meaningful and precise
    opponentsRef.current.forEach(opp => {
      opp.reactionTime = Math.max(5, (opp.style === 'cautious' ? 35 : opp.style === 'steady' ? 25 : 50) - Math.floor(levelRef.current * 0.8));
    });
  }, [level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ensure audio is resumed on first interaction
      SFXManager.resumeAudio(); 

      // Prevent scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      keys.current.add(e.code);
      
      // Discrete actions that should only trigger once per press
      if (e.code === 'KeyI' && !e.repeat) {
        playerRef.current.cruiseControl = true;
        playerRef.current.targetSpeed = Math.min(playerRef.current.targetSpeed + 0.5, 5);
        setPlayer({ ...playerRef.current });
        speak(`Cruise speed set to ${Math.round(playerRef.current.targetSpeed * 10)} miles per hour`);
      }
      if (e.code === 'KeyK' && !e.repeat) {
        playerRef.current.targetSpeed = Math.max(playerRef.current.targetSpeed - 0.5, 0);
        playerRef.current.cruiseControl = playerRef.current.targetSpeed > 0;
        setPlayer({ ...playerRef.current });
        speak(`Cruise speed set to ${Math.round(playerRef.current.targetSpeed * 10)} miles per hour`);
      }
      // Layout Toggle (Discrete action)
      if (e.code === 'KeyL' && !e.repeat) {
        layoutRef.current = layoutRef.current === 'primary' ? 'secondary' : 'primary';
        speak(`Switched to ${layoutRef.current} keyboard layout.`);
      }

      // Shift-7 (usually Key7 with shiftKey or Digit7) to pause/resume
      if ((e.code === 'Digit7' || e.key === '7' || e.key === '&') && e.shiftKey && !e.repeat) {
        isPausedRef.current = !isPausedRef.current;
        setIsPaused(isPausedRef.current);
        speak(isPausedRef.current ? "Game Paused" : "Resuming Game");
      }

      if (e.code === 'KeyS') {
        SFXManager.playBleat(playerRef.current.characteristics);
      }

      const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');

      // Lane-based movement
      if (!e.repeat && (e.code === 'ArrowLeft' || (layoutRef.current === 'secondary' && e.code === 'KeyA'))) {
        const currentLane = Math.round(playerRef.current.x / 100);
        const nextLane = Math.max(-4, currentLane - 1);
        if (nextLane !== currentLane) {
          playerRef.current.x = nextLane * 100;
          setPlayer({ ...playerRef.current });
          PredictorEngine.recordLane(nextLane);
          speak(`Lane ${nextLane + 5}`);
        }
      }
      if (!e.repeat && (e.code === 'ArrowRight' || (layoutRef.current === 'secondary' && e.code === 'KeyD'))) {
        const currentLane = Math.round(playerRef.current.x / 100);
        const nextLane = Math.min(3, currentLane + 1);
        if (nextLane !== currentLane) {
          playerRef.current.x = nextLane * 100;
          setPlayer({ ...playerRef.current });
          PredictorEngine.recordLane(nextLane);
          speak(`Lane ${nextLane + 5}`);
        }
      }

      // Information Keys (Primary Layout EXCLUSIVELY)
      if (layoutRef.current === 'primary') {
        if (e.code === 'KeyB') {
          const remaining = topScore > scoreRef.current ? topScore - scoreRef.current : 0n;
          speak(`Current score is ${scoreRef.current} points. You need ${remaining} more points to reach the top score.`);
        }
        if (e.code === 'KeyA') {
          const env = getEnvironment(levelRef.current, hasApiKey);
          speak(`You are currently in the ${env} environment. The surroundings are breathtaking.`);
        }
        if (e.code === 'KeyW') {
           const lane = Math.round(playerRef.current.x / 100) + 5; // 1-8 lanes
           speak(`Current location: ${Math.floor(distanceRef.current)} feet. Lane number ${lane}. Position: X ${Math.floor(playerRef.current.x)}, Z ${Math.floor(playerRef.current.z)}.`);
        }
        if (e.code === 'KeyC') {
          const c = playerRef.current.characteristics;
          speak(`You are riding a ${c.size} ${c.gender} goat. It is ${c.color} with ${c.eyeColor} eyes and ${c.hornColor} horns. Dimensions: ${c.length} long, ${c.height} high at the shoulder, ${c.chest} chest, and ${c.width} wide.`);
        }
        if (e.code === 'KeyO') {
          const reports = opponentsRef.current
            .map(opp => {
              const relZ = Math.round(opp.z - playerRef.current.z);
              return { opp, relZ };
            })
            .sort((a, b) => Math.abs(a.relZ) - Math.abs(b.relZ))
            .slice(0, 3);

          let summary = "Opponent scan complete. ";
          if (reports.length > 0) {
            const lines = reports.map(r => {
              const direction = r.relZ >= 0 ? "feet ahead" : "feet behind";
              const laneNum = Math.round(r.opp.x / 100) + 5;
              const stateSuffix = r.opp.stumbleTimer ? " Stumbling from collision." : r.opp.isDrafting ? " Slipstreaming in drafting mode." : "";
              return `${r.opp.name}, a ${r.opp.size} goat, is ${Math.abs(r.relZ)} ${direction} running in lane ${laneNum}.${stateSuffix}`;
            });
            summary += lines.join(" ");
          } else {
            summary += "No opponents found running in the immediate vicinity.";
          }

          if (hasApiKey) {
            const nodeHash = Math.floor(1000 + Math.random() * 9000).toString(16);
            summary += ` Decentralized synchronization active. Peer node-${nodeHash} sync solid.`;
          }
          speak(summary);
        }
      } else {
        // Secondary Layout EXCLUSIVELY
        if (e.code === 'KeyE') {
          speak(`Score board: ${scoreRef.current} points. Level ${levelRef.current}.`);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keys.current.delete(e.code);
    };
    
    const handleBlur = () => {
      keys.current.clear();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const updateRef = useRef<() => void>(null as any);
  updateRef.current = () => {
    const p = playerRef.current;
    
    if (isPausedRef.current || pausedOutside) {
      if (canvasRef.current) {
        renderFrame(canvasRef.current, p, levelRef.current, obstaclesRef.current, frameRef.current, opponentsRef.current);
      }
      return;
    }
    
    if (welcomeActiveRef.current) {
      if (canvasRef.current) {
        renderFrame(canvasRef.current, p, levelRef.current, obstaclesRef.current, frameRef.current, opponentsRef.current);
      }
      return;
    }
    
    // Rhythmic Gallop Timing (Scientifically determined)
    const gallopInterval = p.characteristics.gait?.interval || 300;

    // Gallop cycle handling
    const currentTime = Date.now();
    if (p.speed > 0.1 && !p.isJumping) {
      if (!p.lastGallopTime || currentTime - p.lastGallopTime > gallopInterval) {
        SFXManager.playGallop(p.speed);
        p.lastGallopTime = currentTime;
      }
    }

    // Control Handling
    const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');

    if (keys.current.has('ArrowLeft') || (layoutRef.current === 'secondary' && keys.current.has('KeyA'))) p.rotation += 0.05;
    if (keys.current.has('ArrowRight') || (layoutRef.current === 'secondary' && keys.current.has('KeyD'))) p.rotation -= 0.05;
    
    let acceleration = 0;
    if (keys.current.has('ArrowUp') || (layoutRef.current === 'secondary' && keys.current.has('KeyW'))) {
      acceleration = 0.02;
      p.cruiseControl = false;
    } else if (keys.current.has('ArrowDown') || (layoutRef.current === 'secondary' && keys.current.has('KeyS'))) {
      acceleration = -0.05;
      p.cruiseControl = false;
    } else if (!p.cruiseControl) {
      acceleration = -0.01;
    }

    const getMods = (size: string) => {
      let speedMod = 1;
      let jumpMod = 1;
      if (size === 'small') { speedMod = 1.2; jumpMod = 0.9; }
      else if (size === 'large') { speedMod = 0.8; jumpMod = 1.3; }
      else if (size === 'largest') { speedMod = 0.5; jumpMod = 0.7; }
      return { speed: speedMod, jump: jumpMod };
    };

    const currentMods = getMods(p.characteristics.size);

    if (p.cruiseControl) {
      const diff = p.targetSpeed - p.speed;
      p.speed += diff * 0.1;
    } else {
      p.speed = Math.max(0, Math.min(p.speed + acceleration * currentMods.speed, 5 * currentMods.speed));
    }

    // Physics
    const pathCurve = levelRef.current > 1 ? Math.sin(distanceRef.current * 0.001) * (levelRef.current * 20) : 0;
    p.z += p.speed * 2;
    distanceRef.current += p.speed;
    frameRef.current++;
    PredictorEngine.recordSpeed(p.speed);
    
    // Level-specific obstacle spawning using Level configuration and deterministic PRNG
    const currentLvlConfig = getLevelConfig(levelRef.current);
    const spawnThreshold = currentLvlConfig.spawnThreshold;
    const courseLength = currentLvlConfig.courseLength;
    
    if (distanceRef.current - lastSpawnRef.current > spawnThreshold) {
      lastSpawnRef.current = distanceRef.current;
      
      // Zero spawning inside the 500 feet start buffer and 500 feet end buffer
      if (distanceRef.current >= 500 && distanceRef.current <= courseLength - 500) {
        const spawned = generateObstacleAtDistance(levelRef.current, distanceRef.current);

        obstaclesRef.current.push({
          x: pathCurve + spawned.xOffset,
          z: p.z + 1500,
          type: spawned.type,
          width: spawned.width
        });
        // Keep list small
        if (obstaclesRef.current.length > 30) obstaclesRef.current.shift();
      }
    }

    // Treat Spawning
    if (distanceRef.current - lastTreatSpawnRef.current > spawnThreshold * 1.5) {
      lastTreatSpawnRef.current = distanceRef.current;
      
      if (distanceRef.current >= 1000 && distanceRef.current <= courseLength - 1000) {
        const spawnedTreat = generateTreatAtDistance(levelRef.current, distanceRef.current);
        treatsRef.current.push({
          x: pathCurve + spawnedTreat.xOffset,
          z: p.z + 1500,
          spec: spawnedTreat.treatSpec
        });
        if (treatsRef.current.length > 20) treatsRef.current.shift();
      }
    }

    // Obstacle Logic
    obstaclesRef.current.forEach(obs => {
      // Smart obstacle strafing (lateral movement)
      if (hasApiKey && !obs.cleared) {
        // Obstacle sways smoothly over lanes
        obs.x += Math.sin((frameRef.current + obs.z) * 0.04) * 1.5;
      }

      const dx = p.x - obs.x;
      const dz = p.z - obs.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      const obstacleWidth = (obs.width || 1) * 100;
      const laneMatch = Math.abs(dx) < obstacleWidth / 2;
      
      // Collision Detection
      if (!obs.cleared && Math.abs(dz) < 40 && p.y < 0.2 && laneMatch) { // Hit!
        p.speed *= 0.5; // Slow down
        p.targetSpeed *= 0.5;
        SFXManager.playFoul();
        speak("Ouch!");
        PredictorEngine.recordCrash();
        // Move obstacle away so we don't hit it again immediately
        obs.z -= 100;
        // Bumped, but no penalty of going back to 0 or losing points per artistic guidelines.
      }

      // CLEAR Detection (Scoring points for jumping over)
      if (!obs.cleared && Math.abs(dz) < 100 && p.y > 0.1 && laneMatch) {
        obs.cleared = true;
        comboCountRef.current++;
        let bonus = 10n;
        if (comboCountRef.current === 3) bonus = 20n;
        if (comboCountRef.current === 4) bonus = 20n;
        if (comboCountRef.current >= 5) bonus = 40n;
        
        scoreRef.current += bonus;
        
        // Play calibrated combo synthesizer cue rather than spamming TTS to avoid screen-reader overload
        SFXManager.playComboSound(comboCountRef.current);
      }

      // Audio Panning for obstacles (spatial awareness)
      const absDz = Math.abs(dz);
      if (dz < 1000 && frameRef.current % 10 === 0) {
        const pan = (obs.x - p.x) / 500;
        SFXManager.playObstacleApproach(pan, dz);
      }
    });

    // Treat Logic
    treatsRef.current.forEach(treat => {
      const dx = p.x - treat.x;
      const dz = p.z - treat.z;
      const laneMatch = Math.abs(dx) < 100;

      // Collision Detection for Gobbling
      if (!treat.collected && Math.abs(dz) < 60 && p.y < 0.2 && laneMatch) {
        treat.collected = true;
        scoreRef.current += BigInt(treat.spec.points);
        
        // Gobble effect! Boost target speed based on treat spec.
        p.speed += 0.5; // Instant burst
        
        // We could also do a temporary speedBoost, but a burst and score is fine.
        SFXManager.playComboSound(5); // Reuse combo sound as an arcadey treat sound
        speak(`Gobbled ${treat.spec.name}!`);
      }
    });

    // Ambient Layers (Overwhelming components) - ENHANCED for Harmonic Quality
    if (frameRef.current % 120 === 0) {
       // Root and Harmonics (Scientific Tuning)
       const base = 40 + Math.random() * 10; 
       SFXManager.playAmbient(base); // Sub
       SFXManager.playAmbient(base * 2 + Math.random() * 5); // Harmonic 1
       SFXManager.playAmbient(base * 3 + Math.random() * 10); // Harmonic 2
       SFXManager.playAmbient(base * 4 + Math.random() * 20); // Harmonic 3
       SFXManager.playAmbient(base * 6 + Math.random() * 30); // Harmonic 4 (Fifth)
       if (Math.random() > 0.8) SFXManager.playAmbient(30 + Math.random() * 10); // Ultra-deep drone
       
       // Unlocked premium subharmonic sound effects
       if (hasApiKey) {
         SFXManager.playAmbient(base * 1.5 + Math.random() * 5); // Perfect fifth sub-drone
       }
    }

    // Jump Logic (Scientifically Grounded Gravitational Kinematics)
    const GRAVITY = 0.015; // Adjusted for Giant Breed momentum
    const jumpEnergy = p.characteristics.size === 'small' ? 0.45 : p.characteristics.size === 'largest' ? 0.65 : 0.55;
    
    if (keys.current.has('Space') && !p.isJumping) {
      p.isJumping = true;
      p.vy = jumpEnergy * currentMods.jump;
      SFXManager.playJump();

      // Find nearest upcoming obstacle to record jump learning telemetry
      const nearestObs = obstaclesRef.current.find(o => o.z > p.z && !o.cleared);
      if (nearestObs) {
        PredictorEngine.recordJump(nearestObs.z - p.z);
      } else {
        PredictorEngine.recordJump(400);
      }
    }

    if (p.isJumping) {
      p.y += p.vy;
      p.vy -= GRAVITY;
      
      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.isJumping = false;
        comboCountRef.current = 0;
        // Impact sound based on mass
        SFXManager.playClop(0, p.characteristics.size === 'largest' ? 60 : 80);
      }
    }

    // Update Refs and sync to State
    // scoreRef.current += BigInt(Math.floor(p.speed * 100)); // Removed arbitrary score increase
    
    // Top Score Check
    if (scoreRef.current > topScore) {
      setTopScore(scoreRef.current);
    }

    setPlayer({ ...p });
    setScore(scoreRef.current);

    // Level Progression Logic (Scientifically longer courses: 45,000 feet base)
    const maxProgression = hasApiKey ? 999999 : 400; // Unlimited levels unlocked via API Key
    if (distanceRef.current > courseLength && levelRef.current < maxProgression) {
      distanceRef.current = 0;
      levelRef.current += 1;
      setLevel(levelRef.current);
    }
    
    // 5. Onboard computer players using Pseudorandom PRNG decision engine
    opponentsRef.current.forEach(opp => {
      const decision = computeOpponentDecision(
        opp.id,
        opp.x,
        opp.z,
        p.z,
        p.speed,
        levelRef.current,
        obstaclesRef.current,
        {
          playerX: p.x,
          otherOpponents: opponentsRef.current,
          stumbleTimer: opp.stumbleTimer,
          currentSpeed: opp.speed,
          size: opp.size,
          style: opp.style
        }
      );

      opp.targetLane = decision.targetLane;
      opp.isDrafting = decision.isDrafting;
      opp.isOvertaking = decision.isOvertaking;
      opp.speed += (decision.computedSpeed - opp.speed) * 0.08;
      opp.z += opp.speed * 2;

      if (decision.shouldJump && !opp.isJumping) {
        opp.isJumping = true;
        opp.vy = decision.jumpVy ?? (opp.size === 'small' ? 0.44 : opp.size === 'largest' ? 0.62 : 0.52);
      }

      // Situational vocalizations calibrated by decision engine
      const distToPlayer = opp.z - p.z;
      if (decision.shouldBleat && Math.abs(distToPlayer) < 1200) {
        SFXManager.playBleat(opp.size);
      } else {
        const bleatRate = 0.0004 + Math.min(0.001, levelRef.current * 0.00005);
        if (Math.random() < bleatRate && Math.abs(distToPlayer) < 900) {
          SFXManager.playBleat(opp.size);
        }
      }

      // Decrement stumble timer
      if (opp.stumbleTimer && opp.stumbleTimer > 0) {
        opp.stumbleTimer--;
      }

      // Smooth horizontal pacing
      const targetX = opp.targetLane * 100;
      opp.x += (targetX - opp.x) * 0.12;

      // Obstacle collision & clearing check for opponents
      obstaclesRef.current.forEach(obs => {
        const obsDz = obs.z - opp.z;
        const obstacleWidth = (obs.width || 1) * 100;
        const laneMatch = Math.abs(opp.x - obs.x) < obstacleWidth / 2;
        if (!obs.cleared && Math.abs(obsDz) < 40 && opp.y < 0.2 && laneMatch) {
          // Stumble on collision
          opp.speed *= 0.6;
          opp.stumbleTimer = 45;
          obs.z -= 100;
          if (Math.abs(distToPlayer) < 800) {
            SFXManager.playBleat(opp.size);
          }
        }
      });

      // Air gravity mechanics
      if (opp.isJumping) {
        opp.y += opp.vy;
        opp.vy -= GRAVITY;
        if (opp.y <= 0) {
          opp.y = 0;
          opp.vy = 0;
          opp.isJumping = false;
        }
      }
    });

    if (canvasRef.current) {
      renderFrame(canvasRef.current, p, levelRef.current, obstaclesRef.current, frameRef.current, opponentsRef.current, treatsRef.current);
    }
  };

  useEffect(() => {
    const loop = () => {
      if (updateRef.current) updateRef.current();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (farmAmbienceRef.current) {
        try {
          const { gain, source } = farmAmbienceRef.current;
          gain.gain.setValueAtTime(0, gain.context.currentTime);
          source.stop();
          source.disconnect();
          gain.disconnect();
        } catch (e) {}
        farmAmbienceRef.current = null;
      }
      // Save game metrics to IndexedDB database upon unmounting to build persistent leaderboard
      if (scoreRef.current > 0n) {
        IndexedDBStore.logSession({
          timestamp: new Date().toISOString(),
          totalScore: Number(scoreRef.current),
          levelReached: levelRef.current,
          rider: selectedRider ? selectedRider.name : 'Rider',
          goat: goatId,
        }).catch(err => console.error("IndexedDB session save failed:", err));
      }
    };
  }, []); // Run once on mount, loop managed safely via the Ref pattern

  return {
    gameState: player,
    score,
    level,
    topScore,
    controls: keys.current
  };
}

function getEnvironment(level: number, hasApiKey?: boolean): GameEnvironment {
  const envs: GameEnvironment[] = [
    'farm' as any, 'jungle' as any, 'desert' as any, 'city' as any, 'mountain' as any, 'cave' as any, 
    'europe' as any, 'china' as any, 'vietnam' as any, 'thailand' as any, 'philippines' as any, 
    'australia' as any, 'new_zealand' as any, 'argentina' as any, 'montana' as any,
    'nebula_plains' as any, 'crystal_canyon' as any, 'lava_lake' as any, 'steam_station' as any, 'ghost_grove' as any,
    'pixel_peaks' as any, 'cyber_city' as any, 'glitch_glade' as any, 'ice_glacier' as any, 'dungeon' as any
  ];
  if (hasApiKey && level > 25) {
    // Dynamically loop or expand premium design environments
    const premiumEnvs: GameEnvironment[] = [
      'nebula_plains', 'cyber_city', 'glitch_glade', 'lava_lake', 'steam_station', 'crystal_canyon', 'ice_glacier', 'dungeon'
    ] as any;
    return premiumEnvs[(level - 26) % premiumEnvs.length];
  }
  return envs[(level - 1) % envs.length];
}

