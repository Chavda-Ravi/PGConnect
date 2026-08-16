const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            console.log("Admin already exists!");
            console.log(`Email: ${existingAdmin.email}`);

            await mongoose.connection.close();
            return;
        }

        // Admin details
        const name = "System Admin";
        const email = "admin@pgconnect.com";
        const phone_no = "9999999999";
        const password = "user1234";

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = new User({
            name,
            email,
            phone_no,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();

        console.log("=================================");
        console.log("Admin created successfully!");
        console.log("=================================");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: admin`);
        console.log("=================================");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();