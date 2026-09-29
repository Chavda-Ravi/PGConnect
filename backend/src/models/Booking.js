const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PGListing",
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        duration: {
            type: Number,
            required: true,
            min: 1,
        },

        message: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled"],
            default: "pending",
        },

        // ----- Payment-ready fields (Razorpay integration later) -----
        // No gateway wired yet, but the schema supports the real states now
        // so you won't need a data migration when you add it.

        amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "refunded", "failed"],
            default: "unpaid",
        },

        paymentId: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Booking", bookingSchema);