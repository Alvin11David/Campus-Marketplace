const cache = new Map<string, { data: any; ts: number }>();
const inflight = new Map<string, Promise<any>>();
const TTL = 60_000;

export function prefetchListing(id: string | number) {
  const key = String(id);
  if (cache.has(key)) return;
  if (inflight.has(key)) return;

  const p = import("@/lib/api")
    .then(({ apiGet, mapListing }) =>
      apiGet<any>(`/listings/${key}`).then((d) => mapListing(d)),
    )
    .then((data) => {
      cache.set(key, { data, ts: Date.now() });
      inflight.delete(key);
    })
    .catch(() => {
      inflight.delete(key);
    });

  inflight.set(key, p);
}

export function getCachedListing(id: string | number): any | null {
  const key = String(id);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}
