const express = require("express");

const router = express.Router();

const {
  createReview,
  getMyReviews,
  getPGReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createReview);

router.get("/my", authMiddleware, getMyReviews);

router.get("/pg/:pgId", authMiddleware, getPGReviews);

router.put("/:id", authMiddleware, updateReview);

router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
