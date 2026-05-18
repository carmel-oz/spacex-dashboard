const PREFIX = 'spx:'

/**
 * Returns cached data if fresh, otherwise calls fetchFn(), stores the result, and returns it.
 * On 429 rate-limit errors, falls back to stale cached data if available.
 *
 * @param {string}   key      - Unique cache key (no prefix needed)
 * @param {number}   ttlMs    - Time-to-live in milliseconds
 * @param {Function} fetchFn  - Async function that returns the data to cache
 */
export async function getCached(key, ttlMs, fetchFn) {
  const storageKey = PREFIX + key
  const raw = localStorage.getItem(storageKey)

  if (raw) {
    try {
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts < ttlMs) {
        return data  // fresh cache hit — zero network calls
      }
    } catch {
      // corrupted entry — ignore and re-fetch
      localStorage.removeItem(storageKey)
    }
  }

  try {
    const data = await fetchFn()
    localStorage.setItem(storageKey, JSON.stringify({ data, ts: Date.now() }))
    return data
  } catch (err) {
    // On rate-limit (429): silently return stale data if we have it
    if (err?.response?.status === 429 && raw) {
      try {
        const { data } = JSON.parse(raw)
        return data
      } catch {
        // stale cache also corrupt — fall through and re-throw
      }
    }
    throw err
  }
}
