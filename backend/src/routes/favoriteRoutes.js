const express = require("express");

const router = express.Router();

const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/:pgId", authMiddleware, addFavorite);

router.delete("/:pgId", authMiddleware, removeFavorite);

router.get("/", authMiddleware, getMyFavorites);

router.get("/:pgId", authMiddleware, checkFavorite);

module.exports = router;
