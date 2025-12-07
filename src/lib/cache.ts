type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | null {
    const record = this.store.get(key);
    if (!record) return null;
    const isExpired = Date.now() > record.expiresAt;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }
    return record.value;
  }

  set(key: string, value: T) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}


