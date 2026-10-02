const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const { uploadPGImage } = require("../controllers/uploadController");

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "Image too large. Maximum allowed file size is 5 MB.",
                });
            }
            return res.status(400).json({
                message: err.message || "Invalid file upload.",
            });
        }
        next();
    });
};

// Only owners can upload PG images
router.post(
    "/pg-image",
    authMiddleware,
    authorizeRoles("pg_owner"),
    handleUpload,
    uploadPGImage,
);

module.exports = router;