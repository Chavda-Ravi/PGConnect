const PGListing = require("../models/PGListing");

const getAllPGs = async (req, res) => {
  try {
    const pgs = await PGListing.find()
      .populate("ownerId", "name email phone_no")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pgs.length,
      pgs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPGById = async (req, res) => {
  try {
    const pg = await PGListing.findById(req.params.id).populate(
      "ownerId",
      "name email phone_no",
    );

    if (!pg) {
      return res.status(404).json({
        message: "PG not found",
      });
    }

    res.status(200).json({
      pg,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const searchPGs = async (req, res) => {
  try {
    const { city, minRent, maxRent, roomType, foodRequired, acRequired } =
      req.query;

    const filter = {};

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (minRent || maxRent) {
      filter.rent = {};

      if (minRent) {
        filter.rent.$gte = Number(minRent);
      }

      if (maxRent) {
        filter.rent.$lte = Number(maxRent);
      }
    }

    if (roomType) {
      filter.roomType = {
        $regex: roomType,
        $options: "i",
      };
    }

    if (foodRequired !== undefined) {
      filter.foodRequired = foodRequired === "true";
    }

    if (acRequired !== undefined) {
      filter.acRequired = acRequired === "true";
    }

    const pgs = await PGListing.find(filter)
      .populate("ownerId", "name email phone_no")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pgs.length,
      pgs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPGs,
  getPGById,
  searchPGs,
};
