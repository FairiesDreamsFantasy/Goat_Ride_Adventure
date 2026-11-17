import { GoatCharacteristics } from '../../../System/Logic/types';

export const renderThunder = (ctx: CanvasRenderingContext2D, char: GoatCharacteristics, sizeScale: number, bobOffset: number) => {
  const goatColor = '#94a3b8';
  
  // Neck (Thicker for Ram)
  ctx.fillStyle = goatColor;
  ctx.beginPath();
  ctx.moveTo(-120 * sizeScale, 150);
  ctx.lineTo(-80 * sizeScale, -150 * sizeScale);
  ctx.lineTo(80 * sizeScale, -150 * sizeScale);
  ctx.lineTo(120 * sizeScale, 150);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -180 * sizeScale, 100 * sizeScale, 120 * sizeScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Powerful Curved Horns (Black)
  ctx.fillStyle = '#111827';
  // Left heavy curve
  ctx.beginPath();
  ctx.arc(-80 * sizeScale, -250 * sizeScale, 60 * sizeScale, Math.PI, Math.PI * 2);
  ctx.lineWidth = 40 * sizeScale;
  ctx.strokeStyle = '#111827';
  ctx.stroke();
  
  // Right heavy curve
  ctx.beginPath();
  ctx.arc(80 * sizeScale, -250 * sizeScale, 60 * sizeScale, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Eyes (Brown)
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-40 * sizeScale, -210 * sizeScale, 10 * sizeScale, 0, Math.PI * 2);
  ctx.arc(40 * sizeScale, -210 * sizeScale, 10 * sizeScale, 0, Math.PI * 2);
  ctx.fill();
};
