/**
 * Rabbit Rider: Zion Garden - Graphics Manager
 * Coordinates rendering of objects, textures, and geometric shapes.
 */

import { PixelRenderer, PixelGrid } from './Pixel_Logic/PixelRenderer';

export class GraphicsManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvasId?: string) {
    if (canvasId) {
      this.setCanvas(canvasId);
    }
  }

  setCanvas(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  clear() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawTexture(texture: PixelGrid, x: number, y: number, size: number = 4) {
    if (this.ctx) {
      PixelRenderer.render(this.ctx, texture, x, y, size);
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
    if (this.ctx) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    }
  }

  drawCircle(x: number, y: number, radius: number, color: string) {
    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
  }
}
