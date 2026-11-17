export class IndexedDBStore {
  static async logSession(data: Record<string, any>): Promise<void> {
    try {
      console.log('[IndexedDBStore] Logging session data:', data);
    } catch (e) {
      console.error('[IndexedDBStore] Error logging session:', e);
    }
  }

  static async getLogs(): Promise<any[]> {
    return [];
  }
}
