/**
 * Client-side TTL cache for GET-like data.
 * Does not change API contracts — only avoids repeat network calls.
 */

const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function cacheSet(key, value, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + Math.max(0, ttlMs) })
  return value
}

export function cacheInvalidate(key) {
  store.delete(key)
}

export function cacheInvalidatePrefix(prefix) {
  for (const key of store.keys()) {
    if (String(key).startsWith(prefix)) store.delete(key)
  }
}

export function cacheClear() {
  store.clear()
}

export async function cachedFetch(key, ttlMs, fn) {
  const hit = cacheGet(key)
  if (hit !== undefined) return hit
  const value = await fn()
  cacheSet(key, value, ttlMs)
  return value
}

export const CLIENT_CACHE_TTL = {
  PUBLIC: 90_000,
  NOTES_LIST: 45_000,
  NOTE_DETAIL: 10 * 60_000,
  MOCK_LIST: 45_000,
  MOCK_DETAIL: 5 * 60_000,
  ADMIN: 45_000,
  ADMIN_SEARCH: 30_000,
}
