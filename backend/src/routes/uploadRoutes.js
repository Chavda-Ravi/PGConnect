const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const { uploadPGImage } = require("../controllers/uploadController");

const router = express.Router();

// Only owners can upload PG images
router.post(
    "/pg-image",
    authMiddleware,
    authorizeRoles("pg_owner"),
    upload.single("image"),
    uploadPGImage,
);

module.exports = router;