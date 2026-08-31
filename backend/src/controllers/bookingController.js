const Booking = require("../models/Booking");
const PGListing = require("../models/PGListing");

const isInvalidObjectId = (error) => error.name === "CastError";

const createBooking = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can create booking requests",
      });
    }

    const { pgId, startDate, duration, message } = req.body;

    if (!pgId || !startDate || !duration) {
      return res.status(400).json({
        message: "PG ID, start date and duration are required",
      });
    }

    const bookingStartDate = new Date(startDate);

    if (isNaN(bookingStartDate.getTime())) {
      return res.status(400).json({
        message: "Invalid start date",
      });
    }

    if (bookingStartDate <= new Date()) {
      return res.status(400).json({
        message: "Start date must be a future date",
      });
    }

    if (duration < 1) {
      return res.status(400).json({
        message: "Duration must be at least 1 month",
      });
    }

    const pg = await PGListing.findById(pgId);

    if (!pg) {
      return res.status(404).json({
        message: "PG listing not found",
      });
    }

    const existingBooking = await Booking.findOne({
      studentId: req.user.userId,
      pgId,
      status: {
        $in: ["pending", "accepted"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "You already have an active booking request for this PG",
      });
    }

    const booking = await Booking.create({
      studentId: req.user.userId,
      pgId,
      startDate: bookingStartDate,
      duration,
      message: message || "",
    });

    res.status(201).json({
      message: "Booking request created successfully",
      booking,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid PG listing ID",
      });
    }

    console.error("Create Booking Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getStudentBookings = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their bookings",
      });
    }

    const bookings = await Booking.find({
      studentId: req.user.userId,
    })
      .populate("pgId", "pgName address city contactNo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Student Bookings Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can view booking requests",
      });
    }

    const myPGs = await PGListing.find({
      ownerId: req.user.userId,
    }).select("_id");

    const pgIds = myPGs.map((pg) => pg._id);

    const bookings = await Booking.find({
      pgId: {
        $in: pgIds,
      },
    })
      .populate("studentId", "name email phone_no")
      .populate("pgId", "pgName address city contactNo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Owner Bookings Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("studentId", "name email phone_no")
      .populate("pgId", "pgName address city contactNo ownerId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const userId = req.user.userId.toString();

    const isStudent = booking.studentId._id.toString() === userId;

    const isOwner =
      booking.pgId.ownerId && booking.pgId.ownerId.toString() === userId;

    if (!isStudent && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({
      booking,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    console.error("Get Booking Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const acceptBooking = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can accept bookings",
      });
    }

    const booking = await Booking.findById(req.params.id).populate("pgId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.pgId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only manage bookings for your own PG",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Booking cannot be accepted because it is already ${booking.status}`,
      });
    }

    booking.status = "accepted";

    await booking.save();

    res.status(200).json({
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    console.error("Accept Booking Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    if (req.user.role !== "pg_owner") {
      return res.status(403).json({
        message: "Only PG Owners can reject bookings",
      });
    }

    const booking = await Booking.findById(req.params.id).populate("pgId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.pgId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only manage bookings for your own PG",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Booking cannot be rejected because it is already ${booking.status}`,
      });
    }

    booking.status = "rejected";

    await booking.save();

    res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    console.error("Reject Booking Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can cancel bookings",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only cancel your own booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    if (isInvalidObjectId(error)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    console.error("Cancel Booking Error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getStudentBookings,
  getOwnerBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};
