const mongoose = require("mongoose");

const pgListingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pgName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    contactNo: {
      type: String,
      required: true,
    },

    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PGListing", pgListingSchema);
