import { Obstacle, PlayerState, ComputerOpponent, TreatItem } from '../Logic/types';
import { GOAT_VISUALS } from '../../Characters/GoatDispatcher';

function getEnvironment(level: number) {
  const envs = [
    'farm', 'jungle', 'desert', 'city', 'mountain', 'cave', 
    'europe', 'china', 'vietnam', 'thailand', 'philippines', 
    'australia', 'new_zealand', 'argentina', 'montana',
    'nebula_plains', 'crystal_canyon', 'lava_lake', 'steam_station', 'ghost_grove',
    'pixel_peaks', 'cyber_city', 'glitch_glade', 'ice_glacier', 'dungeon'
  ];
  return envs[(level - 1) % envs.length];
}

export function renderFrame(
  canvas: HTMLCanvasElement,
  player: PlayerState,
  level: number,
  obstacles: Obstacle[] = [],
  frameCount: number = 0,
  opponents: ComputerOpponent[] = [],
  treats: TreatItem[] = []
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set sizing with physical screen resolution aware scaling
  const rect = canvas.getBoundingClientRect();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const targetWidth = Math.floor(rect.width * dpr);
  const targetHeight = Math.floor(rect.height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  // Use logical width & height boundaries to calculate geometry consistently
  const w = rect.width;
  const h = rect.height;

  ctx.save();
  ctx.scale(dpr, dpr);

  // Scientific Path Curvature
  const getPathOffset = (z: number) => {
    return level > 1 ? Math.sin(z * 0.001) * (level * 20) : 0;
  };

  const env = getEnvironment(level);
  let cameraMode: 'normal' | 'pits' | 'tunnel' = 'normal';
  if (env === 'dungeon') {
    const cycleZ = player.z % 9000;
    if (cycleZ >= 3000 && cycleZ < 6000) {
      cameraMode = 'pits';
    } else if (cycleZ >= 6000 && cycleZ < 9000) {
      cameraMode = 'tunnel';
    }
  }

  // A. SIDEWAYS TUNNEL GRAPHICS SHIFT
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
    obstacles.forEach(obs => {
      const obsX = w / 2 + (obs.z - player.z) * 1.2;
      const obsLaneOffset = (obs.x / 400) * 80;
      const obsY = h * 0.72 + obsLaneOffset;
      
      if (obsX > -200 && obsX < w + 200) {
        ctx.save();
        ctx.translate(obsX, obsY);
        const oSize = 40;
        
        if (obs.type === 'log') {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(-20, -10, 40, 20);
          ctx.strokeStyle = '#3E2723';
          ctx.strokeRect(-20, -10, 40, 20);
        } else if (obs.type === 'rock') {
          ctx.fillStyle = '#757575';
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(0, -25);
          ctx.lineTo(20, 0);
          ctx.fill();
        } else if (obs.type === 'bush') {
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
    const pLaneOffset = (player.x / 400) * 80;
    const pY = h * 0.72 + pLaneOffset - player.y * 1.2;
    
    ctx.save();
    ctx.translate(w / 2, pY);
    
    const bobFreq = frameCount * (player.speed * 0.1);
    const headBob = Math.sin(bobFreq) * (player.speed * 1.5);
    const bodySway = Math.cos(bobFreq * 0.5) * (player.speed * 1.0);
    
    const pScale = 30 * (player.characteristics.size === 'small' ? 0.75 : player.characteristics.size === 'largest' ? 1.4 : 1.1);
    const bodyColor = player.characteristics.color || '#FFFFFF';
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
    ctx.strokeStyle = player.characteristics.hornColor || '#B8860B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pScale * 0.4, -pScale * 0.38 + headBob);
    ctx.quadraticCurveTo(pScale * 0.5, -pScale * 0.65 + headBob, pScale * 0.6, -pScale * 0.55 + headBob);
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = player.characteristics.eyeColor || '#fbbf24';
    ctx.beginPath();
    ctx.arc(pScale * 0.5, -pScale * 0.28 + headBob, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    ctx.restore();
    return;
  }

  // B. FACE-TO-CAMERA PIT BRIDGE ROTATED VIEW LINK 
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
      const screenX = w/2 + (getPathOffset(nextShaftZ) - player.x) * perspective;
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
    const xHorizonL = ((-150 + getPathOffset(player.z + 3000) - player.x) * 0.05);
    const xHorizonR = ((150 + getPathOffset(player.z + 3000) - player.x) * 0.05);
    const xBottomL = ((-150 + getPathOffset(player.z) - player.x) * 10);
    const xBottomR = ((150 + getPathOffset(player.z) - player.x) * 10);
    
    ctx.beginPath();
    ctx.moveTo(xHorizonL, 0);
    ctx.lineTo(xHorizonR, 0);
    ctx.lineTo(xBottomR, h/2);
    ctx.lineTo(xBottomL, h/2);
    ctx.closePath();
    ctx.fill();

    // Draw bridge sides/rails
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(xHorizonL, 0); ctx.lineTo(xBottomL, h/2);
    ctx.moveTo(xHorizonR, 0); ctx.lineTo(xBottomR, h/2);
    ctx.stroke();

    // Draw abyssal depth lines reflecting pitch black empty pits
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
    obstacles.forEach(obs => {
      const camZ = player.z + 1000;
      const dz = camZ - obs.z;
      
      if (dz > 0 && dz < 2000) {
        const perspective = 400 / dz;
        const dx = obs.x - player.x;
        const screenX = w / 2 - dx * perspective; // mirrored perspective
        const screenY = h / 2 + (h/4 * perspective); 
        const size = 50 * perspective;
        const halfVisualWidth = ( (obs.width || 1) * 100 / 2 ) * perspective;

        ctx.save();
        ctx.translate(screenX, screenY);
        if (obs.type === 'log') {
          ctx.fillStyle = '#5D4037';
          ctx.fillRect(-halfVisualWidth, -size*0.5, halfVisualWidth * 2, size * 0.5);
        } else if (obs.type === 'rock') {
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
        const dx = opp.x + getPathOffset(opp.z) - player.x;
        const screenX = w / 2 - dx * perspective;
        const screenY = h / 2 + (opp.y * perspective) + (10 * perspective);
        const size = 35 * perspective;
        const heightScale = opp.size === 'small' ? 0.75 : opp.size === 'largest' ? 1.4 : 1.1;
        const actualSize = size * heightScale;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.fillStyle = opp.color;
        
        // Front-facing layout body
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

    // 6. Draw Player (Goat) facing camera directly
    ctx.save();
    
    const bobFreq = frameCount * (player.speed * 0.1);
    const headBob = Math.sin(bobFreq) * (player.speed * 4);
    const bodySway = Math.cos(bobFreq * 0.5) * (player.speed * 2.5);
    
    ctx.translate(w/2 + bodySway, h - 160 + headBob);
    ctx.rotate(-player.rotation * 1.5 + (bodySway * 0.02));
    
    const sizeScale = player.characteristics.size === 'small' ? 1.6 : player.characteristics.size === 'largest' ? 2.8 : player.characteristics.size === 'large' ? 2.2 : 1.9;
    const goatId = Object.keys(GOAT_VISUALS).find(id => id.replace(/_/g, ' ').toLowerCase().includes(player.characteristics.name.toLowerCase())) || 'white_standard';
    const renderGoat = GOAT_VISUALS[goatId] || GOAT_VISUALS.white_standard;
    
    renderGoat(ctx, player.characteristics, sizeScale, headBob);
    ctx.restore();

    ctx.restore();
    return;
  }

  // C. STANDARD MODE DRAW PATH (normal dungeon and standard levels)
  // 1. Clear background (Atmospheric)
  ctx.fillStyle = getSkyColor(env);
  ctx.fillRect(0, 0, w, h);

  // 2. Draw Ground (N64 perspective style)
  ctx.save();
  ctx.translate(w / 2, h / 2);
  
  // Horizon color
  ctx.fillStyle = getGroundColor(env);
  ctx.beginPath();
  ctx.moveTo(-w/2, 0);
  ctx.lineTo(w/2, 0);
  ctx.lineTo(w/2, h/2);
  ctx.lineTo(-w/2, h/2);
  ctx.fill();

  // If in standard dungeon, draw vertical ceiling and vent shafts in ceiling
  if (env === 'dungeon') {
    // Fill upper sky area with stone gray-dark ceiling
    const ceilingHeight = h * (0.12 + Math.sin(player.z * 0.0005) * 0.04);
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(-w/2, -h/2, w, ceilingHeight);

    // Draw vertical vent shafts on ceiling
    const shaftSpacing = 2000;
    const nextShaftZ = Math.floor(player.z / shaftSpacing) * shaftSpacing;
    for (let offsetZ = -shaftSpacing; offsetZ <= shaftSpacing * 2; offsetZ += shaftSpacing) {
      const shaftZ = nextShaftZ + offsetZ;
      const dz = shaftZ - player.z;
      if (dz > 0 && dz < 3000) {
        const perspective = 400 / dz;
        const screenX = (getPathOffset(shaftZ) - player.x) * perspective;
        const shaftWidth = 140 * perspective;
        
        ctx.fillStyle = '#060609';
        ctx.fillRect(screenX - shaftWidth/2, -h/2, shaftWidth, ceilingHeight + h/2);
        
        // Grates lines
        ctx.strokeStyle = '#2b2b35';
        ctx.lineWidth = Math.max(1, 1.5 * perspective);
        ctx.beginPath();
        for (let gx = -shaftWidth/2; gx <= shaftWidth/2; gx += 15 * perspective) {
          ctx.moveTo(screenX + gx, -h/2);
          ctx.lineTo(screenX + gx, -h/2 + ceilingHeight);
        }
        ctx.stroke();
      }
    }
  }

  // Draw Grid with Lane-based strapping and Path Curves
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  const gridSpacing = 200;
  
  // Vertical lines (strafing lanes)
  for (let laneIdx = -4; laneIdx <= 4; laneIdx++) {
    const laneX = laneIdx * 100;
    const xHorizon = (laneX + getPathOffset(player.z + 5000) - player.x) * 0.05;
    const xBottom = (laneX + getPathOffset(player.z) - player.x) * 10;
    
    ctx.beginPath();
    ctx.moveTo(xHorizon, 0);
    ctx.lineTo(xBottom, h/2);
    ctx.stroke();
  }

  // Draw Obstacles in 3D perspective
  obstacles.forEach(obs => {
    const dx = obs.x - player.x;
    const dz = obs.z - player.z;
    
    if (dz > 0 && dz < 2000) {
      const obstacleWidthInUnits = (obs.width || 1) * 100;
      const perspective = 400 / dz;
      const screenX = dx * perspective;
      const screenY = (h/2) - (h/4 * perspective); 
      
      const size = 50 * perspective;
      const halfVisualWidth = (obstacleWidthInUnits / 2) * perspective;
      
      ctx.save();
      ctx.translate(screenX, screenY);
      
      if (obs.type === 'log') {
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(-halfVisualWidth, 0, halfVisualWidth * 2, size * 0.5);
        ctx.strokeStyle = '#3E2723';
        ctx.strokeRect(-halfVisualWidth, 0, halfVisualWidth * 2, size * 0.5);
      } else if (obs.type === 'rock') {
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.moveTo(-halfVisualWidth, size * 0.5);
        ctx.lineTo(0, -size * 0.2);
        ctx.lineTo(halfVisualWidth, size * 0.5);
        ctx.fill();
      } else if (obs.type === 'bush') {
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2, halfVisualWidth, size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath();
        ctx.ellipse(halfVisualWidth * 0.3, size * 0.1, halfVisualWidth * 0.6, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'fence') {
        ctx.strokeStyle = '#A1887F';
        ctx.lineWidth = 4 * perspective;
        ctx.strokeRect(-halfVisualWidth, 0, halfVisualWidth * 2, size * 0.3);
        ctx.beginPath();
        const posts = obs.width || 1;
        for(let pIdx=0; pIdx <= posts; pIdx++) {
            const px = -halfVisualWidth + (pIdx * (halfVisualWidth * 2 / posts));
            ctx.moveTo(px, 0); ctx.lineTo(px, size * 0.5);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-halfVisualWidth, 0, halfVisualWidth * 2, size);
      }
      
      ctx.restore();
    }
  });

  // Draw Treats
  treats.forEach(treat => {
    const dx = treat.x + getPathOffset(treat.z) - player.x;
    const dz = treat.z - player.z;

    if (!treat.collected && dz > 0 && dz < 2500) {
      const perspective = 400 / dz;
      const screenX = dx * perspective;
      const screenY = 0; // Float slightly above ground? For now, at 0.
      
      const size = 30 * perspective;
      const bounce = Math.sin(frameCount * 0.1) * 10 * perspective;

      ctx.save();
      ctx.translate(screenX, screenY - bounce - size);
      
      // Draw Treat symbol / box
      ctx.fillStyle = treat.spec.color || '#F59E0B';
      
      // We can just render the icon symbol if it's text, or a colored orb
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.max(10, size * 0.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(treat.spec.iconSymbol || '?', 0, 0);
      
      ctx.restore();
    }
  });

  // Draw Computer Opponents in 3D perspective
  opponents.forEach(opp => {
    const dx = opp.x + getPathOffset(opp.z) - player.x;
    const dz = opp.z - player.z;

    if (dz > 0 && dz < 2500) {
      const perspective = 400 / dz;
      const screenX = dx * perspective;
      const screenY = -(opp.y * perspective) - (35 * perspective); 
      
      const size = 35 * perspective;
      const heightScale = opp.size === 'small' ? 0.75 : opp.size === 'largest' ? 1.4 : 1.1;
      const actualSize = size * heightScale;

      const stumbleWobble = (opp.stumbleTimer && opp.stumbleTimer > 0)
        ? Math.sin(frameCount * 0.7) * (opp.stumbleTimer / 45) * (6 * perspective)
        : 0;

      ctx.save();
      ctx.translate(screenX, screenY + stumbleWobble);
      
      ctx.fillStyle = opp.color;
      
      // Goat Body
      ctx.beginPath();
      ctx.ellipse(0, 0, actualSize * 0.5, actualSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // legs
      const legOffset = Math.sin(frameCount * 0.2 + opp.z) * (actualSize * 0.2);
      ctx.strokeStyle = opp.color;
      ctx.lineWidth = Math.max(1, 2.5 * perspective);
      
      ctx.beginPath();
      ctx.moveTo(-actualSize * 0.3, actualSize * 0.2);
      ctx.lineTo(-actualSize * 0.3 + legOffset, actualSize * 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(actualSize * 0.3, actualSize * 0.2);
      ctx.lineTo(actualSize * 0.3 - legOffset, actualSize * 0.5);
      ctx.stroke();

      // head
      ctx.beginPath();
      ctx.ellipse(actualSize * 0.4, -actualSize * 0.2, actualSize * 0.22, actualSize * 0.14, -Math.PI/6, 0, Math.PI * 2);
      ctx.fill();

      // horns
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = Math.max(0.8, 1.5 * perspective);
      ctx.beginPath();
      ctx.moveTo(actualSize * 0.35, -actualSize * 0.35);
      ctx.quadraticCurveTo(actualSize * 0.45, -actualSize * 0.65, actualSize * 0.55, -actualSize * 0.55);
      ctx.stroke();

      // indicator tag
      const isStumbling = (opp.stumbleTimer && opp.stumbleTimer > 0);
      ctx.fillStyle = isStumbling ? 'rgba(185, 28, 28, 0.85)' : opp.isDrafting ? 'rgba(217, 119, 6, 0.85)' : 'rgba(23, 23, 23, 0.7)';
      const labelW = (opp.isDrafting ? 55 : 45) * perspective;
      const labelH = 12 * perspective;
      ctx.fillRect(-labelW / 2, -actualSize * 0.9, labelW, labelH);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(7, Math.floor(7.5 * perspective))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayText = isStumbling ? `${opp.name} 💥` : opp.isDrafting ? `${opp.name} ⚡` : opp.name;
      ctx.fillText(displayText, 0, -actualSize * 0.9 + labelH / 2);

      ctx.restore();
    }
  });

  ctx.restore();

  // Draw Player (Goat)
  const bobFreq = frameCount * (player.speed * 0.1);
  const headBob = Math.sin(bobFreq) * (player.speed * 5); 
  const bodySway = Math.cos(bobFreq * 0.5) * (player.speed * 3);
  
  const cameraElevation = player.characteristics.size === 'small' ? 100 : player.characteristics.size === 'largest' ? 250 : player.characteristics.size === 'large' ? 200 : 150;
  
  ctx.save();
  ctx.translate(w/2 + bodySway, h - cameraElevation + headBob);
  ctx.rotate(player.rotation * 1.5 + (bodySway * 0.02));

  const sizeScale = player.characteristics.size === 'small' ? 1.5 : player.characteristics.size === 'largest' ? 2.8 : player.characteristics.size === 'large' ? 2.2 : 1.8;
  const goatId = Object.keys(GOAT_VISUALS).find(id => id.replace(/_/g, ' ').toLowerCase().includes(player.characteristics.name.toLowerCase())) || 'white_standard';
  const renderGoat = GOAT_VISUALS[goatId] || GOAT_VISUALS.white_standard;
  
  renderGoat(ctx, player.characteristics, sizeScale, headBob);
  ctx.restore();

  // 4. Overlays (Cameo Statue)
  drawCameos(ctx, w, h, player);

  ctx.restore();
}

function getSkyColor(env: string) {
  switch(env) {
    case 'europe': return '#A5C1DC';
    case 'china': return '#D32F2F';
    case 'vietnam': return '#66BB6A';
    case 'thailand': return '#FFB300';
    case 'philippines': return '#0288D1';
    case 'australia': return '#FF7043';
    case 'new_zealand': return '#43A047';
    case 'argentina': return '#81D4FA';
    case 'montana': return '#90A4AE';
    case 'desert': return '#F4A460';
    case 'city': return '#1a1a2e';
    case 'mountain': return '#87CEEB';
    case 'cave': return '#000000';
    case 'jungle': return '#228B22';
    case 'ice_glacier': return '#E0F7FA';
    case 'dungeon': return '#111115';
    default: return '#87CEEB';
  }
}

function getGroundColor(env: string) {
    switch(env) {
      case 'europe': return '#455A64';
      case 'china': return '#8D6E63';
      case 'vietnam': return '#1B5E20';
      case 'thailand': return '#F9A825';
      case 'philippines': return '#01579B';
      case 'australia': return '#BF360C';
      case 'new_zealand': return '#2E7D32';
      case 'argentina': return '#E1F5FE';
      case 'montana': return '#546E7A';
      case 'desert': return '#EDC9AF';
      case 'city': return '#333333';
      case 'mountain': return '#A9A9A9';
      case 'cave': return '#2B1B17';
      case 'jungle': return '#006400';
      case 'ice_glacier': return '#FFFFFF';
      case 'dungeon': return '#2c3539';
      default: return '#7CFC00';
    }
}

function drawCameos(ctx: CanvasRenderingContext2D, w: number, h: number, player: PlayerState) {
    // Abigay Statue logic - always facing north
    // Let's say it appears at fixed coordinates
    const statue = { x: 100, z: 500 };
    const dx = statue.x - player.x;
    const dz = statue.z - player.z;
    
    if (dz > 0 && dz < 2000) {
        const perspective = 1000 / dz;
        const screenX = w/2 + (dx * perspective);
        const screenY = h/2 + (100 * perspective);
        const size = 100 * perspective;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Statue Pedestal
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(-size, -size, size*2, size/2);
        
        // Painted Statue (Abigay Goat + Fairy Rider)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-size/2, -size*2, size, size); // Abigay Statue
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(0, -size*2.5, size/2, 0, Math.PI * 2); // Fairy
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${Math.max(10, size/2)}px monospace`;
        ctx.fillText("ABIGAY STATUE - FACING NORTH", -size, -size*3);
        
        ctx.restore();
    }
}
