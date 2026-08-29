const Favorite = require("../models/Favorite");
const PGListing = require("../models/PGListing");

const addFavorite = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can add PGs to favorites",
      });
    }

    const { pgId } = req.params;

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    const existingFavorite = await Favorite.findOne({
      studentId: req.user.userId,
      pgId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        message: "PG is already in your favorites",
      });
    }

    const favorite = await Favorite.create({
      studentId: req.user.userId,
      pgId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate(
      "pgId",
      "pgName address city description contactNo amenities",
    );

    res.status(201).json({
      message: "PG added to favorites successfully",
      favorite: populatedFavorite,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can remove PGs from favorites",
      });
    }

    const { pgId } = req.params;

    const favorite = await Favorite.findOne({
      studentId: req.user.userId,
      pgId,
    });

    if (!favorite) {
      return res.status(404).json({
        message: "PG is not in your favorites",
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    res.status(200).json({
      message: "PG removed from favorites successfully",
    });
  } catch (error) {
    console.error("Remove Favorite Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view favorites",
      });
    }

    const favorites = await Favorite.find({
      studentId: req.user.userId,
    })
      .populate("pgId", "pgName address city description contactNo amenities")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Get Favorites Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const checkFavorite = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can check favorites",
      });
    }

    const { pgId } = req.params;

    const favorite = await Favorite.findOne({
      studentId: req.user.userId,
      pgId,
    });

    res.status(200).json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Check Favorite Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
};
