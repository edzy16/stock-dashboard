const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

type Counter = {
  count: number;
  windowStart: number;
};

const counters = new Map<string, Counter>();

export const rateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const existing = counters.get(identifier);
  if (!existing) {
    counters.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (now - existing.windowStart > WINDOW_MS) {
    counters.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  counters.set(identifier, existing);
  return true;
};


