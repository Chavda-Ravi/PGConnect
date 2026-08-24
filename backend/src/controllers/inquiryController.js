const Inquiry = require("../models/Inquiry");
const PGListing = require("../models/PGListing");

const createInquiry = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can send inquiries"
            });
        }

        const { pgId, message } = req.body;

        if (!pgId || !message) {
            return res.status(400).json({
                message: "PG ID and message are required"
            });
        }

        const pg = await PGListing.findById(pgId);

        if (!pg) {
            return res.status(404).json({
                message: "PG listing not found"
            });
        }

        const inquiry = await Inquiry.create({
            studentId: req.user.userId,
            pgId,
            message
        });

        res.status(201).json({
            message: "Inquiry sent successfully",
            inquiry
        });

    } catch (error) {
        console.error("Create Inquiry Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getMyInquiries = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can view their inquiries"
            });
        }

        const inquiries = await Inquiry
            .find({ studentId: req.user.userId })
            .populate("pgId", "pgName address city")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: inquiries.length,
            inquiries
        });

    } catch (error) {
        console.error("Get My Inquiries Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getOwnerInquiries = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can view inquiries"
            });
        }

        const myPGs = await PGListing.find({
            ownerId: req.user.userId
        }).select("_id");

        const pgIds = myPGs.map((pg) => pg._id);

        const inquiries = await Inquiry
            .find({ pgId: { $in: pgIds } })
            .populate("studentId", "name email phone_no")
            .populate("pgId", "pgName address city")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: inquiries.length,
            inquiries
        });

    } catch (error) {
        console.error("Get Owner Inquiries Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const respondToInquiry = async (req, res) => {
    try {
        if (req.user.role !== "pg_owner") {
            return res.status(403).json({
                message: "Only PG Owners can respond to inquiries"
            });
        }

        const { response, status } = req.body;

        if (!response) {
            return res.status(400).json({
                message: "Response is required"
            });
        }

        const inquiry = await Inquiry
            .findById(req.params.id)
            .populate("pgId");

        if (!inquiry) {
            return res.status(404).json({
                message: "Inquiry not found"
            });
        }

        if (inquiry.pgId.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only respond to inquiries for your own PG"
            });
        }

        inquiry.response = response;
        inquiry.status = status || "answered";

        await inquiry.save();

        res.status(200).json({
            message: "Inquiry response sent successfully",
            inquiry
        });

    } catch (error) {
        console.error("Respond Inquiry Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createInquiry,
    getMyInquiries,
    getOwnerInquiries,
    respondToInquiry
};