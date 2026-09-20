const express = require("express");

const router = express.Router();

const {
    createPGOwnerProfile,
    getPGOwnerProfile,
    updatePGOwnerProfile
} = require("../controllers/pgOwnerController");

const protect = require("../middleware/authMiddleware");

router.post("/profile", protect, createPGOwnerProfile);

router.get("/profile", protect, getPGOwnerProfile);

router.put("/profile", protect, updatePGOwnerProfile);

module.exports = router;