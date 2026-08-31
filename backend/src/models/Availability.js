const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PGListing",
      required: true,
      unique: true,
    },

    totalBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    availableBeds: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

availabilitySchema.pre("validate", function () {
  if (this.availableBeds > this.totalBeds) {
    throw new Error("Available beds cannot be greater than total beds");
  }
});

module.exports = mongoose.model("Availability", availabilitySchema);
