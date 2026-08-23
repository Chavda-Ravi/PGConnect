const PGOwner = require("../models/PGOwner");

const checkPGOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (req.user.role !== "PG Owner") {
            return res.status(403).json({
                message: "Only PG Owners can manage PG listings"
            });
        }

        const owner = await PGOwner.findOne({
            userId: req.user.userId
        });

        if (!owner) {
            return res.status(404).json({
                message: "PG Owner profile not found"
            });
        }

        req.owner = owner;

        next();

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = checkPGOwner;