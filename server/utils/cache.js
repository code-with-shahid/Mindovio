/**
 * Lightweight in-memory TTL cache + in-flight request dedupe.
 * Single-process Express (Render free) — no Redis required.
 */

const store = new Map()
const inflight = new Map()

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

/** Run async work once per key while in flight (prevents duplicate Gemini/DB storms). */
export async function dedupeAsync(key, fn) {
  if (inflight.has(key)) return inflight.get(key)
  const promise = Promise.resolve()
    .then(fn)
    .finally(() => {
      inflight.delete(key)
    })
  inflight.set(key, promise)
  return promise
}

/** Cache-aside helper: return cached value or compute + store. */
export async function cacheAside(key, ttlMs, fn) {
  const hit = cacheGet(key)
  if (hit !== undefined) return hit
  return dedupeAsync(`aside:${key}`, async () => {
    const again = cacheGet(key)
    if (again !== undefined) return again
    const value = await fn()
    cacheSet(key, value, ttlMs)
    return value
  })
}

export const CACHE_KEYS = {
  PUBLIC_ANNOUNCEMENTS: "public:announcements",
  PUBLIC_NOTIFICATIONS: "public:notifications",
  ADMIN_STATS: "admin:stats",
  ADMIN_ANALYTICS: "admin:analytics",
  ADMIN_PAYMENTS: "admin:payments",
  ADMIN_SUBSCRIPTIONS: "admin:subscriptions",
  ADMIN_SETTINGS: "admin:settings",
}

export const CACHE_TTL = {
  PUBLIC: 60_000,
  ADMIN_STATS: 45_000,
  ADMIN_ANALYTICS: 60_000,
  ADMIN_STATIC: 120_000,
}
