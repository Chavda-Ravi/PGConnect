const { Ratelimit } = require("@upstash/ratelimit");
const redis = require("../config/redis");

// Build limiters only if Redis is available
const buildLimiters = () => {
    if (!redis) return { global: null, auth: null };

    return {
        // 100 requests per minute per IP across all API routes
        global: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(100, "60 s"),
            analytics: true,
            prefix: "rl:global",
        }),

        // 5 attempts per minute per IP for login/register
        auth: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, "20 s"),
            analytics: true,
            prefix: "rl:auth",
        }),
    };
};

const limiters = buildLimiters();

// Factory: returns an Express middleware bound to a specific limiter
const rateLimitMiddleware = (limiterKey) => async (req, res, next) => {
    const limiter = limiters[limiterKey];

    // If Redis is down or env is missing → fail open (allow the request)
    if (!limiter) return next();

    try {
        const identifier = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const { success, limit, remaining, reset } = await limiter.limit(
            identifier,
        );

        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader("X-RateLimit-Remaining", remaining);
        res.setHeader("X-RateLimit-Reset", reset);

        if (!success) {
            return res.status(429).json({
                message: "Too many requests. Please try again later.",
            });
        }

        next();
    } catch (err) {
        // Any Redis error → fail open so the app keeps working
        console.error("Rate limit error:", err.message);
        next();
    }
};

module.exports = rateLimitMiddleware;