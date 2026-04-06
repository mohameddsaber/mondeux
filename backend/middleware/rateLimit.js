const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const stores = new Map();

const getClientKey = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const pruneWindow = (entry, now, windowMs) => {
  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < windowMs);
};

export const createRateLimiter = ({
  windowMs = WINDOW_MS,
  max = MAX_ATTEMPTS,
  message = 'Too many requests. Please try again later.',
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req);
    const entry = stores.get(key) ?? { timestamps: [] };

    pruneWindow(entry, now, windowMs);

    if (entry.timestamps.length >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.timestamps[0] + windowMs - now) / 1000)
      );

      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', '0');

      return res.status(429).json({
        success: false,
        message,
      });
    }

    entry.timestamps.push(now);
    stores.set(key, entry);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.timestamps.length)));

    next();
  };
};
