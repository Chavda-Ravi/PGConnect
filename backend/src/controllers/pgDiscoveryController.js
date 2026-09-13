const PGListing = require("../models/PGListing");

const isInvalidObjectId = (error) => error.name === "CastError";

// Get all PG listings
const getAllPGs = async (req, res) => {
    try {
        const pgs = await PGListing.find()
            .populate("ownerId", "name email phone_no")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: pgs.length,
            pgs,
        });

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
        const pg = await PGListing.findById(req.params.id)
            .populate("ownerId", "name email phone_no");

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

        const filter = {};

        // Search by state
        if (state) {
            filter.state = {
                $regex: `^${state}$`,
                $options: "i",
            };
        }

        // Search by city
        if (city) {
            filter.city = {
                $regex: `^${city}$`,
                $options: "i",
            };
        }

        const pgs = await PGListing.find(filter)
            .populate("ownerId", "name email phone_no")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: pgs.length,
            pgs,
        });

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