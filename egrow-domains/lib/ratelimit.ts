// Απλός περιορισμός αιτημάτων ανά IP, στη μνήμη. Αρκεί για να μην "καίει" κάποιος το API σου.
// Σε serverless κάθε instance έχει δική του μνήμη, άρα είναι best-effort. Για πιο αυστηρό όριο
// χρησιμοποίησε Upstash Redis ή Vercel KV.
const hits = new Map<string, number[]>();

export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
