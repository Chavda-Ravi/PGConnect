const mongoose = require("mongoose");

const pgOwnerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        ownerName: {
            type: String,
            required: true,
            trim: true,
        },

        contactNo: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("PGOwner", pgOwnerSchema);