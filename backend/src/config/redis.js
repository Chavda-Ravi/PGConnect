const { Redis } = require("@upstash/redis");

// Single shared Redis client used across the app.
// Returns null if Upstash env vars are missing, so the app degrades gracefully
// instead of crashing during local development.
const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;

if (hasUpstash) {
    redis = Redis.fromEnv();
    console.log("Upstash Redis client initialized");
} else {
    console.warn(
        "Upstash Redis env vars missing — caching and rate limiting disabled",
    );
}

module.exports = redis;