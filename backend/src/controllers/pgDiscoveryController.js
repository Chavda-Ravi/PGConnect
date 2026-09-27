const PGListing = require("../models/PGListing");
const redis = require("../config/redis");

const isInvalidObjectId = (error) => error.name === "CastError";

// Cache helper — returns cached value or null
const cacheGet = async (key) => {
    if (!redis) return null;
    try {
        const data = await redis.get(key);
        return data || null;
    } catch (err) {
        console.error("Redis get error:", err.message);
        return null;
    }
};

// Cache set — silently fails
const cacheSet = async (key, value, ttlSeconds) => {
    if (!redis) return;
    try {
        await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (err) {
        console.error("Redis set error:", err.message);
    }
};

const CACHE_TTL = 60; // seconds

// Get all PG listings
const getAllPGs = async (req, res) => {
    try {
        const cacheKey = "pg:all";

        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.status(200).json({
                count: cached.count,
                pgs: cached.pgs,
                cached: true,
            });
        }

        const pgs = await PGListing.find()
            .populate({
                path: "ownerId",
                populate: {
                    path: "userId",
                    select: "name email phone_no",
                },
            })
            .sort({ createdAt: -1 });

        const payload = { count: pgs.length, pgs };
        await cacheSet(cacheKey, payload, CACHE_TTL);

        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Get PG listing by ID
const getPGById = async (req, res) => {
    try {
        const pg = await PGListing.findById(req.params.id).populate({
            path: "ownerId",
            populate: {
                path: "userId",
                select: "name email phone_no",
            },
        });

        if (!pg) {
            return res.status(404).json({
                message: "PG not found",
            });
        }

        res.status(200).json({
            pg,
        });
    } catch (error) {
        if (isInvalidObjectId(error)) {
            return res.status(400).json({
                message: "Invalid PG listing ID",
            });
        }

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Search PGs by state and city
const searchPGs = async (req, res) => {
    try {
        const { state, city } = req.query;

        // Normalize for cache key (case-insensitive search → same cache entry)
        const normState = (state || "").toLowerCase().trim();
        const normCity = (city || "").toLowerCase().trim();
        const cacheKey = `pg:search:${normState}:${normCity}`;

        const cached = await cacheGet(cacheKey);
        if (cached) {
            return res.status(200).json({
                count: cached.count,
                pgs: cached.pgs,
                cached: true,
            });
        }

        const filter = {};

        if (state) {
            filter.state = {
                $regex: `^${state}$`,
                $options: "i",
            };
        }

        if (city) {
            filter.city = {
                $regex: `^${city}$`,
                $options: "i",
            };
        }

        const pgs = await PGListing.find(filter)
            .populate({
                path: "ownerId",
                populate: {
                    path: "userId",
                    select: "name email phone_no",
                },
            })
            .sort({ createdAt: -1 });

        const payload = { count: pgs.length, pgs };
        await cacheSet(cacheKey, payload, CACHE_TTL);

        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

module.exports = {
    getAllPGs,
    getPGById,
    searchPGs,
};