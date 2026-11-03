/**
 * Ultra-fast In-Memory Client Cache for Dashboard Navigation
 * Implements Stale-While-Revalidate (SWR) pattern for instant 0ms renders.
 * Pre-seeded with local mock store for pure frontend execution without backend.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

export function getCachedData<T>(key: string, maxAgeMs = 120000): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  // Return data even if stale (for instant render), caller will revalidate
  return entry.data;
}

export function setCachedData<T>(key: string, data: T): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCachedData(keyPattern?: string): void {
  if (!keyPattern) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.includes(keyPattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Fetch with in-memory caching:
 * If cached, callback receives cached data instantly (0ms),
 * then fresh request resolves in the background.
 */
export async function fetchWithCache<T>(
  url: string,
  onData: (data: T) => void,
  options?: RequestInit
): Promise<T | null> {
  const cached = getCachedData<T>(url);
  if (cached !== null) {
    onData(cached);
  }

  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const freshData = await res.json();
      setCachedData(url, freshData);
      onData(freshData);
      return freshData;
    }
  } catch (err) {
    console.warn(`[clientCache] fetch failed for ${url}:`, err);
  }

  return cached;
}
