interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class MediaCache {
  private store = new Map<string, CacheEntry<any>>();
  private inFlightPromises = new Map<string, Promise<any>>();
  private ttlMs: number;

  constructor(ttlMs = 1000 * 60 * 5) { // 5 minutes default
    this.ttlMs = ttlMs;
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, customTtlMs?: number): void {
    const expiresAt = Date.now() + (customTtlMs ?? this.ttlMs);
    this.store.set(key, { data, expiresAt });
  }

  public clear(): void {
    this.store.clear();
    this.inFlightPromises.clear();
  }

  public async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    customTtlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const inFlight = this.inFlightPromises.get(key);
    if (inFlight) {
      return inFlight as Promise<T>;
    }

    const fetchPromise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, customTtlMs);
        return result;
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, fetchPromise);
    return fetchPromise;
  }
}
