const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        pgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PGListing",
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["pending", "answered", "closed"],
            default: "pending"
        },

        response: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Inquiry", inquirySchema);