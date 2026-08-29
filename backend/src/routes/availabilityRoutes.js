const express = require("express");

const router = express.Router();

const {
  createAvailability,
  getPGAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createAvailability);

router.get("/pg/:pgId", authMiddleware, getPGAvailability);

router.put("/:id", authMiddleware, updateAvailability);

router.delete("/:id", authMiddleware, deleteAvailability);

module.exports = router;
