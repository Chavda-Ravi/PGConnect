const mongoose = require("mongoose");

const pgListingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGOwner",
      required: true
    },

    pgName: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    contactNo: {
      type: String,
      required: true
    },

    amenities: {
      type: [String]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PGListing", pgListingSchema);