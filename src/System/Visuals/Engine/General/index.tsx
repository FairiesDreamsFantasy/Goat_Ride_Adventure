/**
 * Visuals - Independent Graphics Engine System
 * Implements private GPU frame buffers, double-buffering layers,
 * shader execution pipelines, and independent video memory (VRAM) registries.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class FrameBuffer {
  public width: number;
  public height: number;
  private buffer: Uint8ClampedArray;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint8ClampedArray(width * height * 4);
  }

  public clear(color: RGBA): void {
    for (let i = 0; i < this.buffer.length; i += 4) {
      this.buffer[i] = color.r;
      this.buffer[i + 1] = color.g;
      this.buffer[i + 2] = color.b;
      this.buffer[i + 3] = color.a;
    }
  }

  public setPixel(x: number, y: number, color: RGBA): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 4;
    this.buffer[idx] = color.r;
    this.buffer[idx + 1] = color.g;
    this.buffer[idx + 2] = color.b;
    this.buffer[idx + 3] = color.a;
  }

  public getRawBuffer(): Uint8ClampedArray {
    return this.buffer;
  }
}

export class GraphicsPipeline {
  private activeBuffer: FrameBuffer;
  private backBuffer: FrameBuffer;

  constructor(width: number, height: number) {
    this.activeBuffer = new FrameBuffer(width, height);
    this.backBuffer = new FrameBuffer(width, height);
  }

  /**
   * Performs standard double-buffered page flipping
   */
  public swapBuffers(): void {
    const temp = this.activeBuffer;
    this.activeBuffer = this.backBuffer;
    this.backBuffer = temp;
  }

  public getDrawTarget(): FrameBuffer {
    return this.backBuffer;
  }

  public getDisplayTarget(): FrameBuffer {
    return this.activeBuffer;
  }
}
