const PGListing = require("../models/PGListing");
const PGOwner = require("../models/PGOwner");

const isInvalidObjectId = (error) => error.name === "CastError";

const addPGListing = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can add PG listings",
            });
        }

        const pgOwner = await PGOwner.findOne({ userId: req.user.userId });

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner account not found",
            });
        }

        const { pgName, address, city, state, description, contactNo } = req.body;

        if (!pgName || !address || !city || !state || !contactNo) {
            return res.status(400).json({
                message:
                    "PG name, address, city, state and contact number are required",
            });
        }

        const pgListing = await PGListing.create({
            ownerId: pgOwner._id,
            pgName,
            address,
            city,
            state,
            description,
            contactNo,
        });

        res.status(201).json({
            message: "PG listing added successfully",
            pgListing,
        });
    } catch (error) {
        console.error("Add PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

// Owner-scoped: returns the logged-in owner's PGs.
// If no token / not an owner, falls through to all PGs (used by public discovery if needed).
const getPGListings = async (req, res) => {
    try {
        // No JWT → return all (used by nothing right now, but safe)
        if (!req.user || req.user.role !== "pg_owner") {
            const pgListings = await PGListing.find()
                .populate("ownerId", "ownerName contactNo city state")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                count: pgListings.length,
                pgListings,
            });
        }

        // Owner → return only their own PGs
        const pgOwner = await PGOwner.findOne({ userId: req.user.userId });

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner account not found",
            });
        }

        const pgListings = await PGListing.find({ ownerId: pgOwner._id })
            .populate("ownerId", "ownerName contactNo city state")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: pgListings.length,
            pgListings,
        });
    } catch (error) {
        console.error("Get PG Listings Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const getPGListingById = async (req, res) => {
    try {
        const pgListing = await PGListing.findById(req.params.id).populate(
            "ownerId",
            "ownerName contactNo city state",
        );

        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found",
            });
        }

        res.status(200).json({
            pgListing,
        });
    } catch (error) {
        if (isInvalidObjectId(error)) {
            return res.status(400).json({
                message: "Invalid PG listing ID",
            });
        }

        console.error("Get PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const updatePGListing = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can update PG listings",
            });
        }

        const pgOwner = await PGOwner.findOne({ userId: req.user.userId });

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner account not found",
            });
        }

        const pgListing = await PGListing.findById(req.params.id);

        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found",
            });
        }

        if (pgListing.ownerId.toString() !== pgOwner._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own PG listing",
            });
        }

        const { pgName, address, city, state, description, contactNo } = req.body;

        if (pgName !== undefined) pgListing.pgName = pgName;
        if (address !== undefined) pgListing.address = address;
        if (city !== undefined) pgListing.city = city;
        if (state !== undefined) pgListing.state = state;
        if (description !== undefined) pgListing.description = description;
        if (contactNo !== undefined) pgListing.contactNo = contactNo;

        await pgListing.save();

        res.status(200).json({
            message: "PG listing updated successfully",
            pgListing,
        });
    } catch (error) {
        if (isInvalidObjectId(error)) {
            return res.status(400).json({
                message: "Invalid PG listing ID",
            });
        }

        console.error("Update PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const deletePGListing = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can delete PG listings",
            });
        }

        const pgOwner = await PGOwner.findOne({ userId: req.user.userId });

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner account not found",
            });
        }

        const pgListing = await PGListing.findById(req.params.id);

        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found",
            });
        }

        if (pgListing.ownerId.toString() !== pgOwner._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own PG listing",
            });
        }

        await PGListing.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "PG listing deleted successfully",
        });
    } catch (error) {
        if (isInvalidObjectId(error)) {
            return res.status(400).json({
                message: "Invalid PG listing ID",
            });
        }

        console.error("Delete PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

module.exports = {
    addPGListing,
    getPGListings,
    getPGListingById,
    updatePGListing,
    deletePGListing,
};