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


// Add PG
router.post(
    "/",
    protect,
    addPGListing
);


// Get all PGs
router.get(
    "/",
    getPGListings
);


// Get PG by ID
router.get(
    "/:id",
    getPGListingById
);


// Update PG
router.put(
    "/:id",
    protect,
    updatePGListing
);


// Delete PG
router.delete(
    "/:id",
    protect,
    deletePGListing
);


module.exports = router;