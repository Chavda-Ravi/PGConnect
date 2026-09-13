const express = require("express");

const router = express.Router();

const {
    addPGListing,
    getPGListings,
    getPGListingById,
    updatePGListing,
    deletePGListing
} = require("../controllers/PGListingController");

const protect = require("../middleware/authMiddleware");


// Add a PG listing
router.post("/", protect, addPGListing);


// Get all PG listings
router.get("/", getPGListings);


// Get PG listing by ID
router.get("/:id", getPGListingById);


// Update PG listing
router.put("/:id", protect, updatePGListing);


// Delete PG listing
router.delete("/:id", protect, deletePGListing);


module.exports = router;