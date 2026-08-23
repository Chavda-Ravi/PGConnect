const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        college: {
            type: String,
            trim: true
        },

        course: {
            type: String,
            trim: true
        },

        year: {
            type: String,
            trim: true
        },

        gender: {
            type: String,
            trim: true
        },

        city: {
            type: String,
            trim: true
        },

        preferredLocation: {
            type: String,
            trim: true
        },

        maxRent: {
            type: Number
        },

        roomType: {
            type: String,
            trim: true
        },

        foodRequired: {
            type: Boolean,
            default: false
        },

        acRequired: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);