require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimitMiddleware = require("./middleware/rateLimit");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const pgListingRoutes = require("./routes/PGListingRoutes");
const studentRoutes = require("./routes/studentRoutes");
const pgOwnerRoutes = require("./routes/pgOwnerRoutes");
const pgDiscoveryRoutes = require("./routes/pgDiscoveryRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

connectDB();

const app = express();

// Trust proxy so req.ip is the real client IP when behind a load balancer
app.set("trust proxy", 1);

// CORS — only allow the configured frontend origin
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);

app.use(express.json());

// Global rate limit — 100 req/min per IP
app.use("/api", rateLimitMiddleware("global"));

app.get("/", (req, res) => {
    res.send("PG Connect Backend is running!");
});

// Auth routes get their own stricter limiter (5/min per IP)
// applied inside the auth router itself

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgListingRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/pgowners", pgOwnerRoutes);
app.use("/api/discovery/pgs", pgDiscoveryRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/availability", availabilityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});