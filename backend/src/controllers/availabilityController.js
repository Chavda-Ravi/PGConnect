const Availability = require("../models/Availability");
const PGListing = require("../models/PGListing");

const isInvalidObjectId = (error) => error.name === "CastError";

const createAvailability = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can manage availability",
      });
    }

    const { pgId, totalBeds, availableBeds } = req.body;

    if (
      pgId === undefined ||
      totalBeds === undefined ||
      availableBeds === undefined
    ) {
      return res.status(400).json({
        message: "PG ID, total beds and available beds are required",
      });
    }

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    if (pg.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can only manage availability for your own PG",
      });
    }

    if (totalBeds < 0 || availableBeds < 0) {
      return res.status(400).json({
        message: "Beds cannot be negative",
      });
    }

    if (availableBeds > totalBeds) {
      return res.status(400).json({
        message: "Available beds cannot be greater than total beds",
      });
    }

    const existingAvailability = await Availability.findOne({
      pgId,
    });

    if (existingAvailability) {
      return res.status(409).json({
        message: "Availability already exists for this PG",
      });
    }

    const availability = await Availability.create({
      pgId,
      totalBeds,
      availableBeds,
    });

    res.status(201).json({
      message: "PG availability created successfully",
      availability,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid PG listing ID",
      });
    }

    console.error("Create Availability Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPGAvailability = async (req, res) => {
  try {
    const { pgId } = req.params;

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    const availability = await Availability.findOne({ pgId }).populate(
      "pgId",
      "pgName address city",
    );

    if (!availability) {
      return res.status(404).json({
        message: "Availability not found for this PG",
      });
    }

    res.status(200).json({
      availability,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid PG listing ID",
      });
    }

    console.error("Get Availability Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can update availability",
      });
    }

    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        message: "Availability not found",
      });
    }

    const pg = await PGListing.findById(availability.pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    if (pg.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can only update availability for your own PG",
      });
    }

    const { totalBeds, availableBeds } = req.body;

    const newTotalBeds =
      totalBeds !== undefined ? totalBeds : availability.totalBeds;

    const newAvailableBeds =
      availableBeds !== undefined ? availableBeds : availability.availableBeds;

    if (newTotalBeds < 0 || newAvailableBeds < 0) {
      return res.status(400).json({
        message: "Beds cannot be negative",
      });
    }

    if (newAvailableBeds > newTotalBeds) {
      return res.status(400).json({
        message: "Available beds cannot be greater than total beds",
      });
    }

    availability.totalBeds = newTotalBeds;
    availability.availableBeds = newAvailableBeds;

    await availability.save();

    res.status(200).json({
      message: "PG availability updated successfully",
      availability,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid availability ID",
      });
    }

    console.error("Update Availability Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can delete availability",
      });
    }

    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        message: "Availability not found",
      });
    }

    const pg = await PGListing.findById(availability.pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    if (pg.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can only delete availability for your own PG",
      });
    }

    await Availability.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "PG availability deleted successfully",
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid availability ID",
      });
    }

    console.error("Delete Availability Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createAvailability,
  getPGAvailability,
  updateAvailability,
  deleteAvailability,
};
