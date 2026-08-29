const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const pgListingRoutes = require("./routes/PGListingRoutes");
const studentRoutes = require("./routes/studentRoutes");
const pgDiscoveryRoutes = require("./routes/pgDiscoveryRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("PG Connect Backend is running!");
});

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/pgs", pgListingRoutes);

app.use("/api/students", studentRoutes);

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
