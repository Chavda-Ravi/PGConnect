const User = require("../models/User");

const checkPGOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can manage PG listings",
      });
    }

    const owner = await User.findById(req.user.userId);

    if (!owner) {
      return res.status(404).json({
        message: "PG Owner account not found",
      });
    }

    req.owner = owner;

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = checkPGOwner;
