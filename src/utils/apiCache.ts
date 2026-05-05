const cache = new Map<string, { data: unknown; timestamp: number }>()

const DEFAULT_TTL = 30_000

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
