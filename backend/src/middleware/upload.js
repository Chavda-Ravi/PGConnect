const multer = require("multer");

// Store file in memory (buffer), never on disk.
// We stream the buffer straight to Cloudinary and never write to the filesystem,
// which keeps the backend portable across hosts (Render, Railway, etc.)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only JPEG, PNG and WebP images are allowed.",
            ),
            false,
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
    },
});

module.exports = upload;