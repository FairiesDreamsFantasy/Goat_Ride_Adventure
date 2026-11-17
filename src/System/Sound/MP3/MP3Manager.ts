
export class MP3Manager {
  private static audio: HTMLAudioElement | null = null;

  static play(url: string, loop: boolean = false) {
    if (this.audio) {
      this.audio.pause();
    }
    this.audio = new Audio(url);
    this.audio.loop = loop;
    this.audio.play().catch(e => console.warn("MP3 Autoplay blocked or failed:", e));
  }

  static stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  static setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}
