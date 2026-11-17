import { GoatCharacteristics } from '../../../System/Logic/types';

export const renderSnowy = (ctx: CanvasRenderingContext2D, char: GoatCharacteristics, sizeScale: number, bobOffset: number) => {
  const goatColor = '#FFFFFF';
  
  // Neck
  ctx.fillStyle = goatColor;
  ctx.beginPath();
  ctx.moveTo(-100 * sizeScale, 150);
  ctx.lineTo(-60 * sizeScale, -150 * sizeScale);
  ctx.lineTo(60 * sizeScale, -150 * sizeScale);
  ctx.lineTo(100 * sizeScale, 150);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -180 * sizeScale, 80 * sizeScale, 100 * sizeScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#fce4ec';
  ctx.beginPath();
  ctx.ellipse(-90 * sizeScale, -230 * sizeScale, 30 * sizeScale, 60 * sizeScale, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(90 * sizeScale, -230 * sizeScale, 30 * sizeScale, 60 * sizeScale, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Horns (Cream)
  ctx.fillStyle = '#FFF9E3';
  ctx.beginPath();
  ctx.moveTo(-40 * sizeScale, -250 * sizeScale);
  ctx.lineTo(-80 * sizeScale, -380 * sizeScale);
  ctx.lineTo(-20 * sizeScale, -270 * sizeScale);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40 * sizeScale, -250 * sizeScale);
  ctx.lineTo(80 * sizeScale, -380 * sizeScale);
  ctx.lineTo(20 * sizeScale, -270 * sizeScale);
  ctx.fill();

  // Eyes (Amber)
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-30 * sizeScale, -210 * sizeScale, 8 * sizeScale, 0, Math.PI * 2);
  ctx.arc(30 * sizeScale, -210 * sizeScale, 8 * sizeScale, 0, Math.PI * 2);
  ctx.fill();
};
