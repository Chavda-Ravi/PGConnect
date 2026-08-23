const PGListing = require("../models/PGListing");
const User = require("../models/User");

const addPGListing = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can add PG listings",
      });
    }

    const owner = await User.findById(req.user.userId);

    if (!owner) {
      return res.status(404).json({
        message: "PG Owner account not found",
      });
    }

    const { pgName, address, city, description, contactNo, amenities } =
      req.body;

    if (!pgName || !address || !city || !contactNo) {
      return res.status(400).json({
        message: "PG name, address, city and contact number are required",
      });
    }

    const pgListing = await PGListing.create({
      ownerId: owner._id,
      pgName,
      address,
      city,
      description,
      contactNo,
      amenities: amenities || [],
    });

    res.status(201).json({
      message: "PG listing added successfully",
      pgListing,
    });
  } catch (error) {
    console.error("Add PG Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPGListings = async (req, res) => {
  try {
    const pgListings = await PGListing.find()
      .populate("ownerId", "name email phone_no")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pgListings.length,
      pgListings,
    });
  } catch (error) {
    console.error("Get PG Listings Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPGListingById = async (req, res) => {
  try {
    const pgListing = await PGListing.findById(req.params.id).populate(
      "ownerId",
      "name email phone_no",
    );

    if (!pgListing) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    res.status(200).json({
      pgListing,
    });
  } catch (error) {
    console.error("Get PG Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updatePGListing = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can update PG listings",
      });
    }

    const owner = await User.findById(req.user.userId);

    if (!owner) {
      return res.status(404).json({
        message: "PG Owner account not found",
      });
    }

    const pgListing = await PGListing.findById(req.params.id);

    if (!pgListing) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    if (pgListing.ownerId.toString() !== owner._id.toString()) {
      return res.status(403).json({
        message: "You can only update your own PG listing",
      });
    }

    const { pgName, address, city, description, contactNo, amenities } =
      req.body;

    if (pgName !== undefined) {
      pgListing.pgName = pgName;
    }

    if (address !== undefined) {
      pgListing.address = address;
    }

    if (city !== undefined) {
      pgListing.city = city;
    }

    if (description !== undefined) {
      pgListing.description = description;
    }

    if (contactNo !== undefined) {
      pgListing.contactNo = contactNo;
    }

    if (amenities !== undefined) {
      pgListing.amenities = amenities;
    }

    await pgListing.save();

    res.status(200).json({
      message: "PG listing updated successfully",
      pgListing,
    });
  } catch (error) {
    console.error("Update PG Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deletePGListing = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can delete PG listings",
      });
    }

    const owner = await User.findById(req.user.userId);

    if (!owner) {
      return res.status(404).json({
        message: "PG Owner account not found",
      });
    }

    const pgListing = await PGListing.findById(req.params.id);

    if (!pgListing) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    if (pgListing.ownerId.toString() !== owner._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own PG listing",
      });
    }

    await PGListing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "PG listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete PG Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addPGListing,
  getPGListings,
  getPGListingById,
  updatePGListing,
  deletePGListing,
};
