const mongoose = require("mongoose");

const pgOwnerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        businessName: {
            type: String,
            trim: true
        },

        contactNo: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        city: {
            type: String,
            trim: true
        },

        state: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PGOwner", pgOwnerSchema);