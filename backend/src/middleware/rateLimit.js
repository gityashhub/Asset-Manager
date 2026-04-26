const buckets = new Map();

function rateLimit({ windowMs = 60_000, max = 30 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > max) {
      const retry = Math.max(1, Math.ceil((bucket.reset - now) / 1000));
      res.set('Retry-After', String(retry));
      return res.status(429).json({ message: `Too many requests. Try again in ${retry}s.` });
    }
    next();
  };
}

module.exports = rateLimit;
