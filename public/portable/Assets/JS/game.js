import { ALL_GOATS, ALL_RIDERS, ENVS, ENV_COLORS } from './constants.js';
import { initAudio, playClop, playJump, playBleat, playAmbient, playObstacleApproach, setEnvAudio, playComboSound, playLevelUp, startFarmAmbience, stopFarmAmbience } from './audio.js';

const OBSTACLE_TYPES = ['Bush', 'Rock', 'Log', 'Fence', 'Crate'];

let selectedGoatId = 'white_standard';
let selectedRiderId = 'steven';
let gameState = 'landing';
let score = 0;
let level = 1;
let distance = 0;
let lastSpawn = 0;
let welcomeActive = true;
let frameCount = 0;
let isPaused = false;
let layout = 'primary';
let targetSpeed = 0;
let cruiseControl = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 0, z: 0, y: 0, vy: 0, speed: 0, lane: 0 };
let obstacles = [];
let keys = {};
let opponents = [
    {
        id: 'opp_pip',
        name: 'Pip',
        x: -360,
        y: 0,
        z: 300,
        speed: 1.8,
        color: '#AB47BC',
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
        x: -240,
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
        x: -120,
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
        color: '#42A5F5',
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
        x: 120,
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
        x: 240,
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
        x: 360,
        y: 0,
        z: 200,
        speed: 2.2,
        color: '#FFB74D',
        size: 'largest',
        targetLane: 3,
        isJumping: false,
        vy: 0,
        reactionTime: 50,
        style: 'aggressive'
    }
];

window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    if((e.code === 'Digit7' || e.key === '7') && e.shiftKey) { 
        isPaused = !isPaused; announce(isPaused ? "Paused" : "Resuming"); return; 
    }
    keys[e.code] = true;
    
    if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if(gameState === 'play') {
        if(e.code === 'KeyL') {
            layout = layout === 'primary' ? 'secondary' : 'primary';
            announce("Switched to " + layout + " keyboard layout.");
        }
        if(e.code === 'KeyI') {
            cruiseControl = true;
            targetSpeed = Math.min(targetSpeed + 0.5, 8);
            announce("Cruise speed set to " + Math.round(targetSpeed * 10) + " miles per hour");
        }
        if(e.code === 'KeyK') {
            targetSpeed = Math.max(targetSpeed - 0.5, 0);
            cruiseControl = targetSpeed > 0;
            announce("Cruise speed set to " + Math.round(targetSpeed * 10) + " miles per hour");
        }

        if(layout === 'primary') {
            if(e.code === 'KeyB') announce("Current score is " + score);
            if(e.code === 'KeyA') announce("You are currently in the " + getEnvName() + " environment. The surroundings are breathtaking.");
            if(e.code === 'KeyW') announce("Level " + level + ", Environment: " + getEnvName() + ". Location: " + Math.floor(player.z) + " feet.");
            if(e.code === 'KeyO') {
                const reports = opponents
                    .map(opp => {
                        const relZ = Math.round(opp.z - player.z);
                        return { opp, relZ };
                    })
                    .sort((a, b) => Math.abs(a.relZ) - Math.abs(b.relZ))
                    .slice(0, 3);

                let summary = "Opponent scan complete. ";
                if (reports.length > 0) {
                    const lines = reports.map(r => {
                        const direction = r.relZ >= 0 ? "feet ahead" : "feet behind";
                        const laneNum = Math.round(r.opp.x / 180) + 5;
                        return `${r.opp.name}, a ${r.opp.size} goat, is ${Math.abs(r.relZ)} ${direction} running in lane ${laneNum}.`;
                    });
                    summary += lines.join(" ");
                } else {
                    summary += "No opponents found running in the immediate vicinity.";
                }

                const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');
                if (hasApiKey) {
                    const nodeHash = Math.floor(1000 + Math.random() * 9000).toString(16);
                    summary += ` Decentralized synchronization active. Peer node-${nodeHash} sync solid.`;
                }
                announce(summary);
            }
            if(e.code === 'KeyC') {
                const g = ALL_GOATS[selectedGoatId];
                announce("Currently riding " + g.name + ". Size: " + g.size + ". " + g.desc + ". Dimensions: " + g.length + " long, " + g.height + " high.");
            }
        } else {
            if(e.code === 'KeyE') announce("Score board: " + score + " points. Level " + level);
        }

        if(e.code === 'KeyS') {
            const g = ALL_GOATS[selectedGoatId];
            playBleat(g.size);
        }
        
        if(!e.repeat && (keys['ArrowLeft'] || (layout === 'secondary' && keys['KeyA']))) {
            player.lane = Math.max(-4, player.lane - 1);
            announce("Lane " + (player.lane + 5));
        }
        if(!e.repeat && (keys['ArrowRight'] || (layout === 'secondary' && keys['KeyD']))) {
            player.lane = Math.min(3, player.lane + 1);
            announce("Lane " + (player.lane + 5));
        }
    }
});
window.addEventListener('keyup', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = false;
});
window.addEventListener('blur', () => { keys = {}; });

function announce(t) {
    const el = document.getElementById('aria-updates');
    if(el) el.innerText = t;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    const u = new SpeechSynthesisUtterance(t);
    window.speechSynthesis.speak(u);
}

function playWelcomeAnnouncement(text, callback) {
    const el = document.getElementById('aria-updates');
    if(el) el.innerText = text;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.15;
        utterance.pitch = 1.0;
        
        let callbackCalled = false;
        const triggerEnd = () => {
            if (!callbackCalled) {
                callbackCalled = true;
                callback();
            }
        };
        
        utterance.onend = triggerEnd;
        utterance.onerror = triggerEnd;
        
        const wordCount = text.split(/\s+/).length;
        const estDurationMs = (wordCount / 2.0) * 1000 + 1500;
        setTimeout(triggerEnd, Math.max(3000, estDurationMs));
        
        window.speechSynthesis.speak(utterance);
    } else {
        setTimeout(callback, 2000);
    }
}

window.showSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'flex';
        const key = localStorage.getItem('FDF_AI_API_KEY') || '';
        const input = document.getElementById('ai-key-input');
        if (input) input.value = key;
        const err = document.getElementById('safeguard-error');
        if (err) err.style.display = 'none';
    }
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
};

window.saveApiKey = function() {
    const input = document.getElementById('ai-key-input');
    if (input) {
        const val = input.value.trim();
        const hasForbidden = /sex|porn|erotic|nude|fetish|bestiality|weapons|violence|terror|kill|spank|drug|marijuana|cocaine|greed|tobacco/i.test(val);
        if (hasForbidden) {
            const err = document.getElementById('safeguard-error');
            if (err) {
                err.innerText = "Safety block triggered. Key contains restricted stems.";
                err.style.display = 'block';
            }
            announce("Safety block triggered. Key contains restricted stems.");
            return;
        }
        localStorage.setItem('FDF_AI_API_KEY', val);
        announce("AI configurations localized. Key set.");
        window.closeSettingsModal();
    }
};

window.clearApiKey = function() {
    const input = document.getElementById('ai-key-input');
    if (input) input.value = '';
    localStorage.removeItem('FDF_AI_API_KEY');
    announce("Credentials purged from local storage.");
    const err = document.getElementById('safeguard-error');
    if (err) err.style.display = 'none';
};

function getEnv() {
    const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');
    if (hasApiKey && level > 25) {
        const premiumEnvs = [
            'nebula_plains', 'cyber_city', 'glitch_glade', 'lava_lake', 'steam_station', 'crystal_canyon', 'ice_glacier', 'dungeon'
        ];
        return premiumEnvs[(level - 26) % premiumEnvs.length];
    }
    return ENVS[(level - 1) % ENVS.length];
}
function getEnvName() { return getEnv().replace('_',' ').toUpperCase(); }

window.showRiderSelection = function() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('rider-selection').style.display = 'block';
    const list = document.getElementById('rider-list');
    list.innerHTML = '';
    Object.entries(ALL_RIDERS).forEach(([id, rider]) => {
        const btn = document.createElement('button');
        btn.className = 'goat-card';
        btn.style.textAlign = 'left';
        btn.style.padding = '24px';
        btn.innerHTML = `
            <div style="display:flex;gap:20px;align-items:center">
                <span style="font-size:48px">👤</span>
                <div>
                    <b style="font-size:24px">${rider.name}</b><br>
                    <i style="opacity:0.6;font-size:14px">${rider.height}</i>
                </div>
            </div>
        `;
        btn.onclick = () => selectRider(id);
        list.appendChild(btn);
    });
};

function selectRider(id) {
    selectedRiderId = id;
    const r = ALL_RIDERS[id];
    document.getElementById('rider-sel-name').innerText = r.name;
    document.getElementById('rider-sel-text').innerText = r.bio;
    document.getElementById('rider-sel-props').innerText = r.height.toUpperCase();
    document.getElementById('rider-next-btn').style.display = 'block';
    document.querySelectorAll('#rider-list .goat-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    announce("Rider selected: " + r.name);
}

window.showSelection = function() {
    document.getElementById('rider-selection').style.display = 'none';
    document.getElementById('selection').style.display = 'block';
    const list = document.getElementById('goat-list');
    list.innerHTML = '';
    Object.entries(ALL_GOATS).forEach(([id, goat]) => {
        const btn = document.createElement('button');
        btn.className = 'goat-card';
        btn.style.textAlign = 'left';
        btn.style.padding = '24px';
        btn.style.height = 'auto';
        btn.innerHTML = `
            <div style="display:flex;gap:20px;align-items:center">
                <span style="font-size:48px">🐐</span>
                <div>
                    <b style="font-size:24px">${goat.name}</b><br>
                    <i style="opacity:0.6;font-size:14px">${goat.color} / ${goat.gender} / ${goat.size}</i>
                </div>
            </div>
            <p style="font-size:14px;margin:16px 0;opacity:0.8">${goat.desc}</p>
            <div style="font-size:12px;opacity:0.5;font-family:monospace">
                DIM: L:${goat.length} H:${goat.height} C:${goat.chest} W:${goat.width}
            </div>
        `;
        btn.onclick = () => selectGoat(id);
        list.appendChild(btn);
    });
};

function selectGoat(id) {
    selectedGoatId = id;
    const g = ALL_GOATS[id];
    document.getElementById('sel-name').innerText = g.name;
    document.getElementById('sel-text').innerText = g.desc;
    document.getElementById('sel-props').innerText = g.size.toUpperCase() + " • " + g.color.toUpperCase() + " • " + g.gender.toUpperCase();
    document.getElementById('ride-btn').style.display = 'block';
    document.querySelectorAll('.goat-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    announce("Goat picked: " + g.name + ". Characteristics loaded.");
}

let adNext = null;
let secondsLeft = 30;
let adInterval = null;

function showAd(next) {
    adNext = next;
    document.getElementById('landing').style.display = 'none';
    document.getElementById('selection').style.display = 'none';
    document.getElementById('game-view').style.display = 'none';
    document.getElementById('interstitial').style.display = 'flex';
    
    secondsLeft = 30;
    const countEl = document.getElementById('ad-countdown');
    if (countEl) countEl.innerText = `ADVERTISEMENT - GAME WILL RESUME IN ${secondsLeft} SECONDS`;
    
    clearInterval(adInterval);
    adInterval = setInterval(() => {
        secondsLeft--;
        if (countEl) countEl.innerText = `ADVERTISEMENT - GAME WILL RESUME IN ${secondsLeft} SECONDS`;
        if (secondsLeft <= 0) {
            closeAd();
        }
    }, 1000);
}

window.closeAd = function() {
    clearInterval(adInterval);
    if(!adNext) return;
    document.getElementById('interstitial').style.display = 'none';
    const next = adNext;
    adNext = null;
    next();
}

window.startGame = function() {
    initAudio();
    showAd(() => {
        const env = getEnv();
        setEnvAudio(env);
        if(env === 'farm') startFarmAmbience();
        else stopFarmAmbience();
        
        gameState = 'play';
        document.getElementById('selection').style.display = 'none';
        document.getElementById('game-view').style.display = 'block';
        
        const container = document.getElementById('game-container');
        if (container) {
            container.tabIndex = 0;
            container.focus();
        }
        
        resize();
        
        player.z = 0;
        distance = 0;
        lastSpawn = 0;
        obstacles = [];
        
        opponents.forEach((opp, i) => {
            opp.z = 200 + i * 50 + Math.random() * 50;
            opp.y = 0;
            opp.vy = 0;
            opp.isJumping = false;
        });

        welcomeActive = true;
        const descriptions = {
            farm: "Welcome to the serene countryside pastures of the farm. Red barns, fields of clover, and rustic picket fences guide your rhythm. Take visual deep breaths, and let's gallop through the peaceful grasses.",
            jungle: "Prepare to blaze a trail through the dense wild jungle. Beware the thick canopy cover, cascading leaves, and mossy logs as you ride deep under the heavy rainforest atmosphere.",
            desert: "Facing the blistering heat of the sun-drenched canyon. Endless sand dunes stretch across this arid valley, populated by prickly cacti, sandstone formations, and parched, dusty lanes.",
            city: "Welcome to the neon-drenched metropolis under a beautiful midnight sky. Concrete asphalt, street rails, grid lines, and concrete barriers span across this bustling night-ride of the city center.",
            mountain: "Prepare to scale the high alpine ridge heights. Snowy mountain winds, sheer grey cliff-faces, and pine trees adorn this elevated trail where only the hardiest mountain goats dare steer.",
            cave: "Plunging deep into the underground abyssal caverns with zero daylight. Whispering draft sounds, magnificent stalactites, and dark basalt stones surround you. Watch the path closely.",
            nebula_plains: "Welcome to the cosmic expanse of Nebula Plains. Floating celestial stardust paths and quantum wormholes drift in the infinite violet starry space around your goat.",
            cyber_city: "Welcome to the neon cybernetic grid layout. Holographic billboards, high-frequency digital beams, and cyber lane grids guide you through this super-charged futuristic racetrack.",
            ice_glacier: "Explore the frozen monolith of the Ice Glacier region. Trot across slick icy paths, plunge into frozen cavernous caves, and climb steep snow-covered hills. Scientifically, animals trampling these deep snowy fields compress the snow pack, which dramatically increases its thermal conductivity, facilitating direct heat conduction that introduces cold ambient air deep into the underlying icy ground to keep the permafrost stable."
        };
        const welcomeDesc = descriptions[env] || `Welcome to the beautiful adventure in the ${env.replace(/_/g, ' ')} region. An epic ride awaits you on the back of your goat across this captivating path.`;
        
        playWelcomeAnnouncement(`Level ${level} welcome announcement: ${welcomeDesc} Get ready to ride! Starting in three... two... one... go!`, () => {
            welcomeActive = false;
        });

        update();
    });
};

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
}
window.onresize = resize;

function spawnObstacle() {
    const laneWidth = 180;
    const OB_TYPES = ['log', 'rock', 'bush', 'fence', 'crate'];
    const type = OB_TYPES[Math.floor(Math.random() * OB_TYPES.length)];
    const spawnThreshold = level === 1 ? 16000 : 10000 - Math.min(5000, level * 100);
    
    const widthRoll = Math.random();
    let width = 1;
    let xOffset = (Math.floor(Math.random() * 8) - 4) * laneWidth;
    if (widthRoll > 0.95) { width = 8; xOffset = -0.5 * laneWidth; }
    else if (widthRoll > 0.85) { width = 3; }

    obstacles.push({
        id: Math.random(),
        z: player.z + spawnThreshold + Math.random() * 500,
        x: (Math.floor(Math.random() * 8) - 4) * laneWidth,
        type: type,
        cleared: false,
        width: width
    });
}

let comboCount = 0;

function update() {
    if(gameState !== 'play') return;
    if(isPaused) { requestAnimationFrame(update); return; }
    
    if (welcomeActive) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
    frameCount++;
    const hasApiKey = typeof window !== 'undefined' && !!localStorage.getItem('FDF_AI_API_KEY');

    if(frameCount % 120 === 0) {
        const root = 40 + Math.random() * 10;
        playAmbient(root); 
        playAmbient(root * 2); 
        playAmbient(root * 3); 
        playAmbient(root * 4); 
        playAmbient(root * 6); 
        if (Math.random() > 0.8) playAmbient(30 + Math.random() * 10);
        
        if (hasApiKey) {
            playAmbient(root * 1.5); // Perfect fifth sub-drone
        }
    }

    const g = ALL_GOATS[selectedGoatId];
    const gallopInterval = g.size === 'small' ? 24 : g.size === 'largest' ? 60 : 40;
    if(frameCount % gallopInterval === 0 && player.speed > 0.05 && player.y === 0) {
        playClop(0, 80); playClop(0.08, 90);
    }

    const targetX = player.lane * 180;
    player.x += (targetX - player.x) * 0.15;

    const speedLimit = g.size === 'small' ? 8.5 : g.size === 'largest' ? 4.5 : 6.5;
    if(keys['ArrowUp'] || (layout === 'secondary' && keys['KeyW'])) { player.speed = Math.min(player.speed + 0.1, speedLimit); cruiseControl = false; }
    else if(keys['ArrowDown'] || (layout === 'secondary' && keys['KeyS'])) { player.speed = Math.max(player.speed - 0.1, 0); cruiseControl = false; }
    else if(cruiseControl) {
        player.speed += (targetSpeed - player.speed) * 0.1;
    } else {
        player.speed = Math.max(player.speed - 0.05, 0);
    }

    if(keys['Space'] && player.y === 0) {
        const jumpPower = g.size === 'small' ? 12 : g.size === 'largest' ? 18 : 15;
        player.vy = jumpPower;
        playJump();
    }
    player.y += player.vy;
    if(player.y > 0) player.vy -= 0.45;
    else { 
        if (player.vy < -5) playClop(0, g.size === 'largest' ? 60 : 80);
        player.y = 0; player.vy = 0; 
        comboCount = 0;
    }

    const rotationTarget = (keys['ArrowRight'] || (layout === 'secondary' && keys['KeyD'])) ? -0.1 : 
                           (keys['ArrowLeft'] || (layout === 'secondary' && keys['KeyA'])) ? 0.1 : 0;
    player.rotation = player.rotation || 0;
    player.rotation += (rotationTarget - player.rotation) * 0.1;

    player.z += player.speed * 22;
    distance += player.speed * 22;
    
    // Update opponents pacing
    opponents.forEach(opp => {
        const distToPlayer = opp.z - player.z;
        let oppTargetSpeed = player.speed;

        // Elastic alignment: Catch up if left behind, or slow down if too far ahead
        if (distToPlayer < -500) {
            oppTargetSpeed = player.speed + 1.5;
        } else if (distToPlayer > 1500) {
            oppTargetSpeed = player.speed * 0.5;
        } else {
            const levelSpeedBonus = Math.min(0.5, level * 0.015);
            if (opp.style === 'aggressive') oppTargetSpeed = player.speed * (1.05 + levelSpeedBonus) + 0.15;
            else if (opp.style === 'steady') oppTargetSpeed = player.speed * (0.98 + levelSpeedBonus);
            else oppTargetSpeed = player.speed * (0.90 + levelSpeedBonus);
        }

        opp.speed += (oppTargetSpeed - opp.speed) * 0.05;
        opp.z += opp.speed * 22;

        // Sensing logic for upcoming obstacles (Mathematical Onboard AI)
        const obstacleAhead = obstacles.find(obs => {
            const obsDz = obs.z - opp.z;
            return obsDz > 20 && obsDz < 650 && !obs.cleared;
        });

        if (obstacleAhead) {
            const obsDz = obstacleAhead.z - opp.z;
            const obstacleLane = Math.round(obstacleAhead.x / 180);
            const opponentLane = Math.round(opp.x / 180);
            const obWidth = obstacleAhead.width || 1;
            const laneMatch = Math.abs(opponentLane - obstacleLane) < (obWidth / 2 + 0.5);

            if (laneMatch) {
                const reactionLimitBonus = level * 8;
                const reactionLimit = (opp.style === 'cautious' ? 380 : opp.style === 'steady' ? 280 : 190) + reactionLimitBonus;
                if (obsDz < reactionLimit) {
                    if (!opp.isJumping) {
                        const baseJumpChance = opp.style === 'aggressive' ? 0.7 : opp.style === 'steady' ? 0.45 : 0.25;
                        const jumpChance = Math.min(0.92, baseJumpChance + (level * 0.008));
                        if (Math.random() < jumpChance) {
                            opp.isJumping = true;
                            opp.vy = opp.size === 'small' ? 12 : opp.size === 'largest' ? 18 : 15;
                        } else {
                            const offsets = [-1, 1];
                            const shift = offsets[Math.floor(Math.random() * offsets.length)];
                            opp.targetLane = Math.max(-4, Math.min(3, opponentLane + shift));
                        }
                    }
                }
            }
        }

        // Random lane shifts and simulation
        const laneChangeRate = 0.0055 + Math.min(0.01, level * 0.0005);
        if (Math.random() < laneChangeRate && !obstacleAhead) {
            if (Math.random() < 0.45) {
                const laneDiff = player.lane - opp.targetLane;
                const shift = laneDiff > 0 ? 1 : laneDiff < 0 ? -1 : 0;
                if (shift !== 0) {
                    opp.targetLane = Math.max(-4, Math.min(3, opp.targetLane + shift));
                }
            } else if (Math.random() < 0.8) {
                const shift = Math.random() < 0.5 ? -1 : 1;
                opp.targetLane = Math.max(-4, Math.min(3, opp.targetLane + shift));
            } else {
                opp.targetLane = Math.floor(Math.random() * 8) - 4;
            }
        }

        const oppTargetX = opp.targetLane * 180;
        opp.x += (oppTargetX - opp.x) * 0.1;

        // Collision checking for opponents
        obstacles.forEach(obs => {
            const obsDz = obs.z - opp.z;
            const obsWidth = (obs.width || 1) * 180;
            const laneMatch = Math.abs(opp.x - obs.x) < obsWidth / 2;
            if (!obs.cleared && Math.abs(obsDz) < 40 && opp.y < 40 && laneMatch) {
                opp.speed *= 0.5;
                obs.cleared = true;
            }
        });

        // Air gravity mechanics for opponents
        if (opp.isJumping) {
            opp.y += opp.vy;
            opp.vy -= 0.45;
            if (opp.y <= 0) {
                opp.y = 0;
                opp.vy = 0;
                opp.isJumping = false;
            }
        }

        // Random opponent bleat SFX
        const bleatRate = 0.0005 + Math.min(0.002, level * 0.0001);
        if (Math.random() < bleatRate) {
            if (Math.abs(distToPlayer) < 1200) {
                playBleat(opp.size);
            }
        }
    });

    const courseLength = 45000 + level * 5000;
    if(distance > courseLength) {
        const maxLevelLimit = hasApiKey ? 999999 : 400;
        level = Math.min(maxLevelLimit, level + 1);
        document.getElementById('level').innerText = "Level " + level + " - " + getEnvName();
        const env = getEnv();
        setEnvAudio(env);
        playLevelUp();
        if(env === 'farm') startFarmAmbience();
        else stopFarmAmbience();
        
        if(level >= maxLevelLimit) {
            gameState = 'over';
            document.getElementById('game-over').style.display = 'flex';
            document.getElementById('final-score').innerText = score;
            document.getElementById('final-level').innerText = level;
            announce("Amazing! You've reached the final level.");
        } else {
            distance = 0;
            player.z = 0;
            lastSpawn = 0;
            obstacles = [];
            opponents.forEach((opp, i) => {
                opp.z = 200 + i * 50 + Math.random() * 50;
                opp.y = 0;
                opp.vy = 0;
                opp.isJumping = false;
            });

            showAd(() => {
                welcomeActive = true;
                const descriptions = {
                    farm: "Welcome to the serene countryside pastures of the farm. Red barns, fields of clover, and rustic picket fences guide your rhythm. Take visual deep breaths, and let's gallop through the peaceful grasses.",
                    jungle: "Prepare to blaze a trail through the dense wild jungle. Beware the thick canopy cover, cascading leaves, and mossy logs as you ride deep under the heavy rainforest atmosphere.",
                    desert: "Facing the blistering heat of the sun-drenched canyon. Endless sand dunes stretch across this arid valley, populated by prickly cacti, sandstone formations, and parched, dusty lanes.",
                    city: "Welcome to the neon-drenched metropolis under a beautiful midnight sky. Concrete asphalt, street rails, grid lines, and concrete barriers span across this bustling night-ride of the city center.",
                    mountain: "Prepare to scale the high alpine ridge heights. Snowy mountain winds, sheer grey cliff-faces, and pine trees adorn this elevated trail where only the hardiest mountain goats dare steer.",
                    cave: "Plunging deep into the underground abyssal caverns with zero daylight. Whispering draft sounds, magnificent stalactites, and dark basalt stones surround you. Watch the path closely.",
                    nebula_plains: "Welcome to the cosmic expanse of Nebula Plains. Floating celestial stardust paths and quantum wormholes drift in the infinite violet starry space around your goat.",
                    cyber_city: "Welcome to the neon cybernetic grid layout. Holographic billboards, high-frequency digital beams, and cyber lane grids guide you through this super-charged futuristic racetrack.",
                    ice_glacier: "Explore the frozen monolith of the Ice Glacier region. Trot across slick icy paths, plunge into frozen cavernous caves, and climb steep snow-covered hills. Scientifically, animals trampling these deep snowy fields compress the snow pack, which dramatically increases its thermal conductivity, facilitating direct heat conduction that introduces cold ambient air deep into the underlying icy ground to keep the permafrost stable."
                };
                const welcomeDesc = descriptions[env] || `Welcome to the beautiful adventure in the ${env.replace(/_/g, ' ')} region. An epic ride awaits you on the back of your goat across this captivating path.`;
                
                playWelcomeAnnouncement(`Level ${level} welcome announcement: ${welcomeDesc} Get ready to ride! Starting in three... two... one... go!`, () => {
                    welcomeActive = false;
                });
            });
        }
    }

    const spawnThreshold = level === 1 ? 2500 : 1500 - Math.min(500, level * 10);
    if (distance - lastSpawn > spawnThreshold) {
        lastSpawn = distance;
        if (distance >= 500 && distance <= courseLength - 500) {
            const laneWidth = 180;
            const OB_TYPES = ['log', 'rock', 'bush', 'fence', 'crate'];
            const type = OB_TYPES[Math.floor(Math.random() * OB_TYPES.length)];
            const widthRoll = Math.random();
            let width = 1;
            let xOffset = (Math.floor(Math.random() * 8) - 4) * laneWidth;
            if (widthRoll > 0.95) { 
                width = 8; 
                xOffset = -50; 
            } else if (widthRoll > 0.85) { 
                width = 3; 
            }

            obstacles.push({
                id: Math.random(),
                z: player.z + 1500,
                x: xOffset,
                type: type,
                cleared: false,
                width: width
            });
        }
    }

    obstacles = obstacles.filter(o => {
        // Obstacle sways smoothly over lanes if premium is enabled
        if (hasApiKey && !o.cleared) {
            o.x += Math.sin((frameCount + o.z) * 0.04) * 2;
        }

        const relZ = o.z - player.z;
        if(relZ < -500) return false;
        
        const absDz = Math.abs(relZ);
        if(absDz < 1000 && frameCount % 10 === 0) {
            const pan = (o.x - player.x) / 500;
            playObstacleApproach(Math.max(-1, Math.min(1, pan)), relZ);
        }

        if(!o.cleared && Math.abs(relZ) < 200) {
            const obWidth = (o.width || 1) * 180;
            const laneMatch = Math.abs(o.x - player.x) < (obWidth / 2);
            if(laneMatch && player.y < 40) {
                player.speed *= 0.2;
                announce("Bumped into " + o.type);
                o.cleared = true;
            } else if (laneMatch && player.y >= 40) {
                comboCount++;
                let add = 10;
                if (comboCount === 3) add = 20;
                if (comboCount === 4) add = 20;
                if (comboCount >= 5) add = 40;
                
                score += add;
                o.cleared = true;
                playComboSound(comboCount);
            }
        }
        return true;
    });

    document.getElementById('score').innerText = score;
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.save();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const currentEnv = getEnv();
    const env = ENV_COLORS[currentEnv] || ENV_COLORS['farm'];

    const laneWidth = 180;
    const horizon = h/2;
    const viewDist = 4000;
    const offsetAt = z => Math.sin(z * 0.0006) * (level % 20 * 15);

    let cameraMode = 'normal';
    if (currentEnv === 'dungeon') {
        const cycleZ = player.z % 9000;
        if (cycleZ >= 3000 && cycleZ < 6000) {
            cameraMode = 'pits';
        } else if (cycleZ >= 6000 && cycleZ < 9000) {
            cameraMode = 'tunnel';
        }
    }

    // A. SIDEWAYS TUNNEL mode (side profile landscape)
    if (cameraMode === 'tunnel') {
        // 1. Draw Slate Gray walls background
        ctx.fillStyle = '#424242';
        ctx.fillRect(0, 0, w, h);

        // 2. Ceilings (mixed high/low ceilings inside dungeon)
        ctx.fillStyle = '#212121';
        ctx.fillRect(0, 0, w, h * 0.25);
        
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        ctx.lineTo(w, h * 0.25);
        ctx.stroke();

        // 3. Mountain/valley wall carvings to highlight craftsmanship under ancient themes
        ctx.strokeStyle = '#353535';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const wallScroll = player.z * 0.15;
        for (let sx = 0; sx <= w + 40; sx += 40) {
            const carveY = h * 0.48 + Math.sin((sx + wallScroll) * 0.005) * 50 + Math.cos((sx + wallScroll) * 0.012) * 20;
            if (sx === 0) ctx.moveTo(sx, carveY);
            else ctx.lineTo(sx, carveY);
        }
        ctx.stroke();

        // 4. Hard Stone Flooring
        ctx.fillStyle = '#37474F';
        ctx.fillRect(0, h * 0.72, w, h * 0.28);
        
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 2;
        const tileScroll = (player.z * 1.5) % 200;
        for (let fx = -tileScroll; fx < w; fx += 200) {
            ctx.beginPath();
            ctx.moveTo(fx, h * 0.72);
            ctx.lineTo(fx, h);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, h * 0.72);
        ctx.lineTo(w, h * 0.72);
        ctx.stroke();

        // 5. Obstacles in profile mode scrolling left-to-right
        obstacles.forEach(o => {
            const obsX = w / 2 + (o.z - player.z) * 1.2;
            const obsLaneOffset = (o.x / 400) * 80;
            const obsY = h * 0.72 + obsLaneOffset;
            
            if (obsX > -200 && obsX < w + 200) {
                ctx.save();
                ctx.translate(obsX, obsY);
                
                if (o.type === 'log') {
                    ctx.fillStyle = '#5D4037';
                    ctx.fillRect(-20, -10, 40, 20);
                    ctx.strokeStyle = '#3E2723';
                    ctx.strokeRect(-20, -10, 40, 20);
                } else if (o.type === 'rock') {
                    ctx.fillStyle = '#757575';
                    ctx.beginPath();
                    ctx.moveTo(-20, 0);
                    ctx.lineTo(0, -25);
                    ctx.lineTo(20, 0);
                    ctx.fill();
                } else if (o.type === 'bush') {
                    ctx.fillStyle = '#2E7D32';
                    ctx.beginPath();
                    ctx.ellipse(0, -10, 25, 20, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(-15, -30, 30, 30);
                }
                ctx.restore();
            }
        });

        // 6. Computer Opponents in profile side-view scrolling left-to-right
        opponents.forEach(opp => {
            const oppX = w / 2 + (opp.z - player.z) * 1.2;
            const oppLaneOffset = (opp.x / 400) * 80;
            const oppY = h * 0.72 + oppLaneOffset - opp.y * 1.2;
            
            if (oppX > -100 && oppX < w + 100) {
                ctx.save();
                ctx.translate(oppX, oppY);
                const actualSize = 25 * (opp.size === 'small' ? 0.75 : opp.size === 'largest' ? 1.4 : 1.1);
                
                ctx.fillStyle = opp.color;
                // Side view Body
                ctx.beginPath();
                ctx.ellipse(0, 0, actualSize * 0.6, actualSize * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Side view Legs
                const legOffset = Math.sin(frameCount * 0.2 + opp.z) * (actualSize * 0.2);
                ctx.strokeStyle = opp.color;
                ctx.lineWidth = Math.max(1.5, actualSize * 0.08);
                ctx.beginPath();
                ctx.moveTo(-actualSize * 0.3, actualSize * 0.2);
                ctx.lineTo(-actualSize * 0.3 + legOffset, actualSize * 0.6);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(actualSize * 0.3, actualSize * 0.2);
                ctx.lineTo(actualSize * 0.3 - legOffset, actualSize * 0.6);
                ctx.stroke();
                
                // Side view Neck & Head
                ctx.beginPath();
                ctx.ellipse(actualSize * 0.4, -actualSize * 0.22, actualSize * 0.22, actualSize * 0.14, -Math.PI/6, 0, Math.PI * 2);
                ctx.fill();
                
                // Horns
                ctx.strokeStyle = '#B8860B';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(actualSize * 0.35, -actualSize * 0.3);
                ctx.quadraticCurveTo(actualSize * 0.45, -actualSize * 0.55, actualSize * 0.55, -actualSize * 0.45);
                ctx.stroke();
                
                // Name Label
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(-20, -actualSize * 0.8 - 10, 40, 10);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 7px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(opp.name, 0, -actualSize * 0.8 - 3);
                
                ctx.restore();
            }
        });

        // 7. Player (Goat) in profile side-view centered horizontally
        const g = ALL_GOATS[selectedGoatId];
        const pLaneOffset = (player.x / 400) * 80;
        const pY = h * 0.72 + pLaneOffset - player.y * 1.2;
        
        ctx.save();
        ctx.translate(w / 2, pY);
        
        const bobFreq = frameCount * (player.speed * 0.1);
        const headBob = Math.sin(bobFreq) * (player.speed * 1.5);
        const bodySway = Math.cos(bobFreq * 0.5) * (player.speed * 1.0);
        
        const pScale = 30 * (g.size === 'small' ? 0.75 : g.size === 'largest' ? 1.4 : 1.1);
        const bodyColor = g.color === 'White' ? '#FFFFFF' : g.color === 'Grey' ? '#9CA3AF' : g.color === 'Brown' ? '#78350F' : g.color === 'Charcoal' ? '#1F2937' : '#FFFFFF';
        ctx.fillStyle = bodyColor;
        
        // Side view Body
        ctx.beginPath();
        ctx.ellipse(0, bodySway, pScale * 0.6, pScale * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Side view Legs
        const pLegOffset = Math.sin(frameCount * 0.2) * (pScale * 0.25);
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = Math.max(2, pScale * 0.08);
        ctx.beginPath();
        ctx.moveTo(-pScale * 0.3, pScale * 0.2 + bodySway);
        ctx.lineTo(-pScale * 0.3 + pLegOffset, pScale * 0.65 + bodySway);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pScale * 0.3, pScale * 0.2 + bodySway);
        ctx.lineTo(pScale * 0.3 - pLegOffset, pScale * 0.65 + bodySway);
        ctx.stroke();
        
        // Side view Neck & Head
        ctx.beginPath();
        ctx.ellipse(pScale * 0.45, -pScale * 0.25 + headBob, pScale * 0.25, pScale * 0.16, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        // Horns
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pScale * 0.4, -pScale * 0.38 + headBob);
        ctx.quadraticCurveTo(pScale * 0.5, -pScale * 0.65 + headBob, pScale * 0.6, -pScale * 0.55 + headBob);
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = g.eyeColor === 'Amber' ? '#fbbf24' : g.eyeColor === 'Brown' ? '#78350F' : g.eyeColor === 'Black' ? '#000000' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(pScale * 0.5, -pScale * 0.28 + headBob, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore(); // inner player translation restore
        ctx.restore(); // outer High-DPR scale restore
        return;
    }

    // B. FACE-TO-CAMERA PIT BRIDGE ROTATED VIEW
    if (cameraMode === 'pits') {
        // 1. Clear background to dark pit void
        ctx.fillStyle = '#030305';
        ctx.fillRect(0, 0, w, h);

        // 2. High/low ceilings inside dungeon
        const ceilingHeight = h * (0.15 + Math.sin(player.z * 0.0004) * 0.04);
        ctx.fillStyle = '#0d0d12';
        ctx.fillRect(0, 0, w, ceilingHeight);

        // Light beam down from overhead ceiling shafts
        const shaftSpacing = 2000;
        const nextShaftZ = Math.floor(player.z / shaftSpacing) * shaftSpacing;
        const dzShaft = nextShaftZ - player.z;
        if (dzShaft > 0 && dzShaft < 3000) {
            const perspective = 400 / dzShaft;
            const screenX = w/2 + (offsetAt(nextShaftZ) - player.x) * (2.5 * perspective);
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.beginPath();
            ctx.moveTo(screenX - 80 * perspective, ceilingHeight);
            ctx.lineTo(screenX + 80 * perspective, ceilingHeight);
            ctx.lineTo(screenX + 240 * perspective, h);
            ctx.lineTo(screenX - 240 * perspective, h);
            ctx.fill();
        }

        // 3. Draw Bridge perspective (narrow lane range)
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.fillStyle = '#263238'; // Dark stone texture
        
        // Narrow bridge lanes from -150 to 150
        const xHorizonL = ((-150 + offsetAt(player.z + 3000) - player.x) * 0.05);
        const xHorizonR = ((150 + offsetAt(player.z + 3000) - player.x) * 0.05);
        const xBottomL = ((-150 + offsetAt(player.z) - player.x) * 10);
        const xBottomR = ((150 + offsetAt(player.z) - player.x) * 10);
        
        ctx.beginPath();
        ctx.moveTo(xHorizonL, 0);
        ctx.lineTo(xHorizonR, 0);
        ctx.lineTo(xBottomR, h/2);
        ctx.lineTo(xBottomL, h/2);
        ctx.closePath();
        ctx.fill();

        // Draw bridge rails
        ctx.strokeStyle = '#455A64';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xHorizonL, 0); ctx.lineTo(xBottomL, h/2);
        ctx.moveTo(xHorizonR, 0); ctx.lineTo(xBottomR, h/2);
        ctx.stroke();

        // Draw depth lines
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = 1;
        for (let depthY = 10; depthY < h/2; depthY += 20) {
            ctx.beginPath();
            ctx.moveTo(-w/2, depthY);
            ctx.lineTo(xBottomL + (xHorizonL - xBottomL) * (depthY / (h/2)), depthY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(xBottomR + (xHorizonR - xBottomR) * (depthY / (h/2)), depthY);
            ctx.lineTo(w/2, depthY);
            ctx.stroke();
        }
        ctx.restore();

        // 4. Draw Obstacles approaching camera (front-looking view)
        obstacles.forEach(o => {
            const camZ = player.z + 1000;
            const dz = camZ - o.z;
            
            if (dz > 0 && dz < 2000) {
                const perspective = 400 / dz;
                const dx = o.x - player.x;
                const screenX = w / 2 - dx * (2.5 * perspective); // mirrored perspective
                const screenY = h / 2 + (h/4 * perspective); 
                const size = 50 * perspective;
                const halfVisualWidth = ( (o.width || 1) * laneWidth / 2 ) * (2.5 * perspective);

                ctx.save();
                ctx.translate(screenX, screenY);
                if (o.type === 'log') {
                    ctx.fillStyle = '#5D4037';
                    ctx.fillRect(-halfVisualWidth, -size*0.5, halfVisualWidth * 2, size * 0.5);
                } else if (o.type === 'rock') {
                    ctx.fillStyle = '#757575';
                    ctx.beginPath();
                    ctx.moveTo(-halfVisualWidth, 0);
                    ctx.lineTo(0, -size * 0.7);
                    ctx.lineTo(halfVisualWidth, 0);
                    ctx.fill();
                } else {
                    ctx.fillStyle = '#1B5E20';
                    ctx.beginPath();
                    ctx.ellipse(0, -size*0.3, halfVisualWidth, size * 0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });

        // 5. Draw computer opponents running towards us (facing camera)
        opponents.forEach(opp => {
            const camZ = player.z + 1000;
            const dz = camZ - opp.z;
            
            if (dz > 0 && dz < 2500) {
                const perspective = 400 / dz;
                const dx = opp.x + offsetAt(opp.z) - player.x;
                const screenX = w / 2 - dx * (2.5 * perspective);
                const screenY = h / 2 + (opp.y * perspective) + (10 * perspective);
                const size = 35 * (2.5 * perspective);
                const heightScale = opp.size === 'small' ? 0.75 : opp.size === 'largest' ? 1.4 : 1.1;
                const actualSize = size * heightScale;

                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.fillStyle = opp.color;
                
                // Front-facing body
                ctx.beginPath();
                ctx.ellipse(0, -actualSize * 0.2, actualSize * 0.4, actualSize * 0.25, 0, 0, Math.PI * 2);
                ctx.fill();

                // Front-facing legs
                const legOffset = Math.sin(frameCount * 0.2 + opp.z) * (actualSize * 0.15);
                ctx.strokeStyle = opp.color;
                ctx.lineWidth = Math.max(1.5, 2 * perspective);
                ctx.beginPath();
                ctx.moveTo(-actualSize * 0.2, 0);
                ctx.lineTo(-actualSize * 0.2, actualSize * 0.3 + legOffset);
                ctx.moveTo(actualSize * 0.2, 0);
                ctx.lineTo(actualSize * 0.2, actualSize * 0.3 - legOffset);
                ctx.stroke();

                // Front face
                ctx.beginPath();
                ctx.ellipse(0, -actualSize * 0.55, actualSize * 0.25, actualSize * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Horns
                ctx.strokeStyle = '#B8860B';
                ctx.beginPath();
                ctx.moveTo(-actualSize * 0.15, -actualSize * 0.8);
                ctx.quadraticCurveTo(-actualSize * 0.25, -actualSize * 1.1, -actualSize * 0.35, -actualSize * 1.0);
                ctx.moveTo(actualSize * 0.15, -actualSize * 0.8);
                ctx.quadraticCurveTo(actualSize * 0.25, -actualSize * 1.1, actualSize * 0.35, -actualSize * 1.0);
                ctx.stroke();

                // Label tag
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(-22 * perspective, -actualSize * 1.2, 44 * perspective, 10 * perspective);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${Math.max(6, 7 * perspective)}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(opp.name, 0, -actualSize * 1.2 + 6 * perspective);

                ctx.restore();
            }
        });

        // 6. Player (Goat) facing camera directly
        const g = ALL_GOATS[selectedGoatId];
        ctx.save();
        
        const bobFreq = frameCount * (player.speed * 0.1);
        const headBob = Math.sin(bobFreq) * (player.speed * 4);
        const bodySway = Math.cos(bobFreq * 0.5) * (player.speed * 2.5);
        
        ctx.translate(w/2 + bodySway, h - 160 + headBob);
        ctx.rotate(-player.rotation * 1.5 + (bodySway * 0.02));
        
        const pScale = g.size === 'small' ? 1.5 : g.size === 'largest' ? 2.8 : g.size === 'large' ? 2.2 : 1.8;
        const bodyColor = g.color === 'White' ? '#FFFFFF' : g.color === 'Grey' ? '#9CA3AF' : g.color === 'Brown' ? '#78350F' : g.color === 'Charcoal' ? '#1F2937' : '#FFFFFF';
        ctx.fillStyle = bodyColor;
        
        // Front-facing body (big round ellipse)
        ctx.beginPath();
        ctx.ellipse(0, 50, 95 * pScale, 110 * pScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, -60 * pScale, 55 * pScale, 60 * pScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = g.eyeColor === 'Amber' ? '#fbbf24' : g.eyeColor === 'Brown' ? '#78350F' : g.eyeColor === 'Black' ? '#000000' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(-20 * pScale, -70 * pScale, 8 * pScale, 0, Math.PI * 2);
        ctx.arc(20 * pScale, -70 * pScale, 8 * pScale, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, -40 * pScale, 12 * pScale, 8 * pScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = g.hornColor === 'Black' ? '#1f2937' : '#4B5563';
        ctx.beginPath();
        ctx.moveTo(-25 * pScale, -110 * pScale);
        ctx.quadraticCurveTo(-45 * pScale, -190 * pScale, -65 * pScale, -170 * pScale);
        ctx.quadraticCurveTo(-35 * pScale, -150 * pScale, -10 * pScale, -115 * pScale);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(25 * pScale, -110 * pScale);
        ctx.quadraticCurveTo(45 * pScale, -190 * pScale, 65 * pScale, -170 * pScale);
        ctx.quadraticCurveTo(35 * pScale, -150 * pScale, 10 * pScale, -115 * pScale);
        ctx.fill();

        ctx.restore(); // inner player translation restore
        ctx.restore(); // outer High-DPR scale restore
        return;
    }

    // C. STANDARD DRAWS (Dungeon normal view and other environments)
    ctx.fillStyle = env.sky; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = env.ground; ctx.fillRect(0, h/2, w, h/2);

    const grad = ctx.createLinearGradient(0, h/2, 0, h);
    grad.addColorStop(0, env.fog);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h/2, w, h/2);

    if (currentEnv === 'dungeon') {
        const ceilingHeight = h * (0.12 + Math.sin(player.z * 0.0005) * 0.04);
        ctx.fillStyle = '#1c1c22';
        ctx.fillRect(0, 0, w, ceilingHeight);

        const shaftSpacing = 2000;
        const nextShaftZ = Math.floor(player.z / shaftSpacing) * shaftSpacing;
        for (let offsetZ = -shaftSpacing; offsetZ <= shaftSpacing * 2; offsetZ += shaftSpacing) {
            const shaftZ = nextShaftZ + offsetZ;
            const dz = shaftZ - player.z;
            if (dz > 0 && dz < 3000) {
                const perspective = 400 / dz;
                const screenX = w/2 + (offsetAt(shaftZ) - player.x) * (2.5 * perspective);
                const shaftWidth = 140 * perspective;
                
                ctx.fillStyle = '#060609';
                ctx.fillRect(screenX - shaftWidth/2, 0, shaftWidth, ceilingHeight);
                
                ctx.strokeStyle = '#2b2b35';
                ctx.lineWidth = Math.max(1, 1.5 * perspective);
                ctx.beginPath();
                for (let gx = -shaftWidth/2; gx <= shaftWidth/2; gx += 15 * perspective) {
                    ctx.moveTo(screenX + gx, 0);
                    ctx.lineTo(screenX + gx, ceilingHeight);
                }
                ctx.stroke();
            }
        }
    }

    const statueZ = Math.floor(player.z / 10000) * 10000 + 5000;
    const relStatueZ = statueZ - player.z;
    if(relStatueZ > 0 && relStatueZ < viewDist) {
        const sc = 1.0 - (relStatueZ / viewDist);
        const sx = w/2 + (400 + offsetAt(statueZ) - player.x) * (2.5 * sc);
        const sy = horizon + (h/2) * (1.0 - sc);
        const sSize = 100 * sc;
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(sx - sSize, sy - sSize, sSize*2, sSize);
        ctx.fillStyle = 'white';
        ctx.fillText("ABIGAY STATUE", sx - sSize, sy - sSize*1.5);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 3;
    for(let i = -4; i <= 4; i++) {
        const lx = i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(w/2 + (lx + offsetAt(player.z + viewDist) - player.x) * 0.05, horizon);
        ctx.lineTo(w/2 + (lx + offsetAt(player.z) - player.x) * 5, h);
        ctx.stroke();
    }

    obstacles.sort((a,b) => b.z - a.z).forEach(o => {
        const relZ = o.z - player.z;
        if(relZ <= 0 || relZ > viewDist) return;
        const scale = 1.0 - (relZ / viewDist);
        const screenX = w/2 + (o.x + offsetAt(o.z) - player.x) * (2.5 * scale);
        const screenY = horizon + (h/2) * (1.0 - scale);
        const visualWidth = ((o.width || 1) * laneWidth) / 2 * (2.5 * scale);
        const heightSize = 150 * scale;
        ctx.fillStyle = o.cleared ? 'rgba(0,0,0,0.2)' : '#4b5563';
        ctx.fillRect(screenX - visualWidth, screenY - heightSize, visualWidth*2, heightSize);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(screenX - visualWidth, screenY - heightSize, visualWidth*2, heightSize);
    });

    const startGateZ = 300;
    const relGateZ = startGateZ - player.z;
    if (relGateZ > -500 && relGateZ < viewDist) {
        const scale = 1.0 - (relGateZ / viewDist);
        if (scale > 0) {
            const screenX = w/2 + (0 + offsetAt(startGateZ) - player.x) * (2.5 * scale);
            const screenY = horizon + (h/2) * (1.0 - scale);
            const gateWidth = 900 * scale; 
            const gateHeight = 350 * scale;
            
            ctx.fillStyle = '#8B4513'; 
            ctx.fillRect(screenX - gateWidth/2 - 20 * scale, screenY - gateHeight, 40 * scale, gateHeight);
            ctx.fillRect(screenX + gateWidth/2 - 20 * scale, screenY - gateHeight, 40 * scale, gateHeight);
            ctx.fillRect(screenX - gateWidth/2 - 20 * scale, screenY - gateHeight, gateWidth + 40 * scale, 50 * scale);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${Math.max(10, Math.floor(18 * scale))}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText("START OF REGION GATE", screenX, screenY - gateHeight + 32 * scale);
        }
    }

    const courseLength = 45000 + level * 5000;
    const relPortalZ = courseLength - player.z;
    if (relPortalZ > -500 && relPortalZ < viewDist) {
        const scale = 1.0 - (relPortalZ / viewDist);
        if (scale > 0) {
            const screenX = w/2 + (0 + offsetAt(courseLength) - player.x) * (2.5 * scale);
            const screenY = horizon + (h/2) * (1.0 - scale);
            const radiusX = 260 * scale;
            const radiusY = 360 * scale;
            
            const grad = ctx.createRadialGradient(screenX, screenY - radiusY/2, 10 * scale, screenX, screenY - radiusY/2, radiusX);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.3, '#E040FB'); 
            grad.addColorStop(1, 'transparent');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - radiusY/2, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#D4AF37'; 
            ctx.lineWidth = Math.max(2, 6 * scale);
            ctx.beginPath();
            ctx.ellipse(screenX, screenY - radiusY/2, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${Math.max(12, Math.floor(22 * scale))}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText("COSMIC ESCAPE PORTAL", screenX, screenY - radiusY - 20 * scale);
        }
    }

    opponents.forEach(opp => {
        const relZ = opp.z - player.z;
        if (relZ <= 0 || relZ > viewDist) return;
        
        const scale = 1.0 - (relZ / viewDist);
        const screenX = w/2 + (opp.x + offsetAt(opp.z) - player.x) * (2.5 * scale);
        const screenY = horizon + (h/2) * (1.0 - scale) - (opp.y * scale * 2.5);
        
        const size = 35 * (2.5 * scale);
        const heightScale = opp.size === 'small' ? 0.75 : opp.size === 'largest' ? 1.4 : 1.1;
        const actualSize = size * heightScale;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.fillStyle = opp.color;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, actualSize * 0.5, actualSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        const legOffset = Math.sin(frameCount * 0.2 + opp.z) * (actualSize * 0.2);
        ctx.strokeStyle = opp.color;
        ctx.lineWidth = Math.max(1, 2.5 * scale);
        
        ctx.beginPath();
        ctx.moveTo(-actualSize * 0.3, actualSize * 0.2);
        ctx.lineTo(-actualSize * 0.3 + legOffset, actualSize * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(actualSize * 0.3, actualSize * 0.2);
        ctx.lineTo(actualSize * 0.3 - legOffset, actualSize * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(actualSize * 0.4, -actualSize * 0.2, actualSize * 0.22, actualSize * 0.14, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = Math.max(0.8, 1.5 * scale);
        ctx.beginPath();
        ctx.moveTo(actualSize * 0.35, -actualSize * 0.35);
        ctx.quadraticCurveTo(actualSize * 0.45, -actualSize * 0.65, actualSize * 0.55, -actualSize * 0.55);
        ctx.stroke();

        ctx.fillStyle = 'rgba(23, 23, 23, 0.7)';
        const labelW = 45 * scale * 2.5;
        const labelH = 12 * scale * 2.5;
        ctx.fillRect(-labelW / 2, -actualSize * 0.9 - labelH, labelW, labelH);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(7, Math.floor(7.5 * scale * 2.5))}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opp.name, 0, -actualSize * 0.9 - labelH / 2);

        ctx.restore();
    });

    const g = ALL_GOATS[selectedGoatId];
    const bob = Math.sin(frameCount * 0.15) * (player.speed * 5);
    const jumpBob = player.y * 1.5;
    
    const cameraElevation = g.size === 'small' ? 100 : g.size === 'largest' ? 250 : g.size === 'large' ? 200 : 150;
    const sizeScale = g.size === 'small' ? 1.5 : g.size === 'largest' ? 2.8 : g.size === 'large' ? 2.2 : 1.8;
    
    ctx.save();
    ctx.translate(w/2, h - cameraElevation + bob - jumpBob);
    ctx.rotate(player.rotation * 1.5);
    
    ctx.fillStyle = g.color === 'White' ? '#FFFFFF' : g.color === 'Grey' ? '#9CA3AF' : g.color === 'Brown' ? '#78350F' : g.color === 'Charcoal' ? '#1F2937' : '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 50, 110 * sizeScale, 130 * sizeScale, 0, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.fillRect(-35 * sizeScale, -70 * sizeScale, 25 * sizeScale, 25 * sizeScale);
    ctx.fillRect(10 * sizeScale, -70 * sizeScale, 25 * sizeScale, 25 * sizeScale);
    
    ctx.fillStyle = g.hornColor === 'Black' ? '#1f2937' : '#4B5563';
    ctx.beginPath();
    ctx.moveTo(-40 * sizeScale, -100 * sizeScale); ctx.lineTo(-70 * sizeScale, -180 * sizeScale); ctx.lineTo(-20 * sizeScale, -110 * sizeScale); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40 * sizeScale, -100 * sizeScale); ctx.lineTo(70 * sizeScale, -180 * sizeScale); ctx.lineTo(20 * sizeScale, -110 * sizeScale); ctx.fill();
    
    ctx.restore(); // inner restore for player translation
    ctx.restore(); // outer restore for High-DPR scale
}
