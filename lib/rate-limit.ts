type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export const rateLimit = {
  check(key: string, opts: { windowMs: number; max: number }): boolean {
    const now = Date.now();
    const existing = store.get(key);
    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return true;
    }
    if (existing.count >= opts.max) return false;
    existing.count += 1;
    return true;
  },
  __reset() {
    store.clear();
  },
};
