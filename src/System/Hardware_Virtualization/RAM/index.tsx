/**
 * Hardware Virtualization - RAM Emulation Engine
 * Implements high-speed emulated system bus, 64KB memory space registries,
 * and secure address read/write handlers.
 */

export class RAMEmulator {
  private memory: Uint8Array;

  constructor(size: number = 65536) {
    this.memory = new Uint8Array(size);
  }

  public readByte(address: number): number {
    return this.memory[address & 0xFFFF];
  }

  public writeByte(address: number, value: number): void {
    this.memory[address & 0xFFFF] = value & 0xFF;
  }

  public dumpMemory(start: number, end: number): Uint8Array {
    return this.memory.slice(start, end);
  }
}
