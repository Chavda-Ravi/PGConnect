const PGListing = require("../models/PGListing");
const PGOwner = require("../models/PGOwner");


// ==========================================
// ADD PG LISTING
// POST /api/pgs
// ==========================================

const addPGListing = async (req, res) => {
    try {
        // Check role
        if (req.user.role !== "PG Owner") {
            return res.status(403).json({
                message: "Only PG Owners can add PG listings"
            });
        }

        // Find PG Owner profile
        const owner = await PGOwner.findOne({
            userId: req.user.userId
        });

        if (!owner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }

        const {
            pgName,
            address,
            city,
            description,
            contactNo,
            amenities
        } = req.body;


        // Validation
        if (!pgName || !address || !city || !contactNo) {
            return res.status(400).json({
                message: "PG name, address, city and contact number are required"
            });
        }


        // Create PG Listing
        const pgListing = await PGListing.create({
            ownerId: owner._id,
            pgName,
            address,
            city,
            description,
            contactNo,
            amenities: amenities || []
        });


        res.status(201).json({
            message: "PG listing added successfully",
            pgListing
        });

    } catch (error) {

        console.error("Add PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



// ==========================================
// GET ALL PG LISTINGS
// GET /api/pgs
// ==========================================

const getPGListings = async (req, res) => {
    try {

        const pgListings = await PGListing
            .find()
            .populate("ownerId", "userId address")
            .sort({ createdAt: -1 });


        res.status(200).json({
            count: pgListings.length,
            pgListings
        });

    } catch (error) {

        console.error("Get PG Listings Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



// ==========================================
// GET SINGLE PG LISTING
// GET /api/pgs/:id
// ==========================================

const getPGListingById = async (req, res) => {
    try {

        const pgListing = await PGListing
            .findById(req.params.id)
            .populate("ownerId", "userId address");


        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found"
            });
        }


        res.status(200).json({
            pgListing
        });

    } catch (error) {

        console.error("Get PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



// ==========================================
// UPDATE PG LISTING
// PUT /api/pgs/:id
// ==========================================

const updatePGListing = async (req, res) => {
    try {

        // Check role
        if (req.user.role !== "PG Owner") {
            return res.status(403).json({
                message: "Only PG Owners can update PG listings"
            });
        }


        // Find PG Owner
        const owner = await PGOwner.findOne({
            userId: req.user.userId
        });


        if (!owner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }


        // Find listing
        const pgListing = await PGListing.findById(
            req.params.id
        );


        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found"
            });
        }


        // Check ownership
        if (pgListing.ownerId.toString() !== owner._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own PG listing"
            });
        }


        // Update fields
        const {
            pgName,
            address,
            city,
            description,
            contactNo,
            amenities
        } = req.body;


        if (pgName !== undefined) {
            pgListing.pgName = pgName;
        }

        if (address !== undefined) {
            pgListing.address = address;
        }

        if (city !== undefined) {
            pgListing.city = city;
        }

        if (description !== undefined) {
            pgListing.description = description;
        }

        if (contactNo !== undefined) {
            pgListing.contactNo = contactNo;
        }

        if (amenities !== undefined) {
            pgListing.amenities = amenities;
        }


        await pgListing.save();


        res.status(200).json({
            message: "PG listing updated successfully",
            pgListing
        });

    } catch (error) {

        console.error("Update PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



// ==========================================
// DELETE PG LISTING
// DELETE /api/pgs/:id
// ==========================================

const deletePGListing = async (req, res) => {
    try {

        // Check role
        if (req.user.role !== "PG Owner") {
            return res.status(403).json({
                message: "Only PG Owners can delete PG listings"
            });
        }


        // Find PG Owner
        const owner = await PGOwner.findOne({
            userId: req.user.userId
        });


        if (!owner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }


        // Find listing
        const pgListing = await PGListing.findById(
            req.params.id
        );


        if (!pgListing) {
            return res.status(404).json({
                message: "PG listing not found"
            });
        }


        // Check ownership
        if (pgListing.ownerId.toString() !== owner._id.toString()) {
            return res.status(403).json({
                message: "You can only delete your own PG listing"
            });
        }


        await PGListing.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message: "PG listing deleted successfully"
        });

    } catch (error) {

        console.error("Delete PG Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



module.exports = {
    addPGListing,
    getPGListings,
    getPGListingById,
    updatePGListing,
    deletePGListing
};