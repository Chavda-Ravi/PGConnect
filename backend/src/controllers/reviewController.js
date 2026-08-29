const Review = require("../models/Review");
const Booking = require("../models/Booking");
const PGListing = require("../models/PGListing");

const createReview = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can create reviews",
      });
    }

    const { pgId, bookingId, rating, comment } = req.body;

    if (!pgId || !bookingId || !rating) {
      return res.status(400).json({
        message: "PG ID, booking ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only review your own booking",
      });
    }

    if (booking.pgId.toString() !== pgId) {
      return res.status(400).json({
        message: "Booking does not belong to this PG",
      });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: "You can only review an accepted booking",
      });
    }

    const existingReview = await Review.findOne({
      studentId: req.user.userId,
      pgId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this PG",
      });
    }

    const review = await Review.create({
      studentId: req.user.userId,
      pgId,
      bookingId,
      rating,
      comment: comment || "",
    });

    const populatedReview = await Review.findById(review._id)
      .populate("studentId", "name email")
      .populate("pgId", "pgName address city");

    res.status(201).json({
      message: "Review created successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create Review Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their reviews",
      });
    }

    const reviews = await Review.find({
      studentId: req.user.userId,
    })
      .populate("pgId", "pgName address city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get My Reviews Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPGReviews = async (req, res) => {
  try {
    const { pgId } = req.params;

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    const reviews = await Review.find({ pgId })
      .populate("studentId", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1)
        : 0;

    res.status(200).json({
      pgId,
      totalReviews,
      averageRating: Number(averageRating),
      reviews,
    });
  } catch (error) {
    console.error("Get PG Reviews Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can update reviews",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only update your own review",
      });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("studentId", "name email")
      .populate("pgId", "pgName address city");

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update Review Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can delete reviews",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only delete your own review",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getPGReviews,
  updateReview,
  deleteReview,
};
