const express = require("express");

const router = express.Router();

const {
  createBooking,
  getStudentBookings,
  getOwnerBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBooking);

router.get("/student", authMiddleware, getStudentBookings);

router.get("/owner", authMiddleware, getOwnerBookings);

router.get("/:id", authMiddleware, getBookingById);

router.put("/:id/accept", authMiddleware, acceptBooking);

router.put("/:id/reject", authMiddleware, rejectBooking);

router.put("/:id/cancel", authMiddleware, cancelBooking);

module.exports = router;
