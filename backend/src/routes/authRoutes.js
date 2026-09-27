const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimitMiddleware = require("../middleware/rateLimit");

const {
    registerUser,
    loginUser,
    getMe,
} = require("../controllers/authController");

const router = express.Router();

// Stricter limit on these two — 5 req/min per IP
router.post("/register", rateLimitMiddleware("auth"), registerUser);
router.post("/login", rateLimitMiddleware("auth"), loginUser);

// Session check — global limit is fine
router.get("/me", authMiddleware, getMe);

module.exports = router;