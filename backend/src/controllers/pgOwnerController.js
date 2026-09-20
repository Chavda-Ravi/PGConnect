const PGOwner = require("../models/PGOwner");
const User = require("../models/User");


// Create PG Owner Profile
const createPGOwnerProfile = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can create a PG Owner profile"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "PG Owner account not found"
            });
        }

        const existingProfile = await PGOwner.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "PG Owner profile already exists"
            });
        }

        const {
            businessName,
            contactNo,
            address,
            city,
            state
        } = req.body;

        const pgOwner = await PGOwner.create({
            userId: user._id,
            businessName,
            contactNo,
            address,
            city,
            state
        });

        res.status(201).json({
            message: "PG Owner profile created successfully",
            pgOwner
        });

    } catch (error) {
        console.error("Create PG Owner Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get PG Owner Profile
const getPGOwnerProfile = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can access this profile"
            });
        }

        const pgOwner = await PGOwner.findOne({
            userId: req.user.userId
        }).populate("userId", "name email role phone_no");

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }

        res.status(200).json({
            pgOwner
        });

    } catch (error) {
        console.error("Get PG Owner Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Update PG Owner Profile
const updatePGOwnerProfile = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can update this profile"
            });
        }

        const pgOwner = await PGOwner.findOne({
            userId: req.user.userId
        });

        if (!pgOwner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }

        const {
            businessName,
            contactNo,
            address,
            city,
            state
        } = req.body;

        if (businessName !== undefined) {
            pgOwner.businessName = businessName;
        }

        if (contactNo !== undefined) {
            pgOwner.contactNo = contactNo;
        }

        if (address !== undefined) {
            pgOwner.address = address;
        }

        if (city !== undefined) {
            pgOwner.city = city;
        }

        if (state !== undefined) {
            pgOwner.state = state;
        }

        await pgOwner.save();

        res.status(200).json({
            message: "PG Owner profile updated successfully",
            pgOwner
        });

    } catch (error) {
        console.error("Update PG Owner Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createPGOwnerProfile,
    getPGOwnerProfile,
    updatePGOwnerProfile
};