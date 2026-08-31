const User = require("../models/User");
const bcrypt = require("bcryptjs");

const isInvalidObjectId = (err) => err.name === "CastError";

const sanitizeUser = (user) => {
    const sanitized = user.toObject ? user.toObject() : user;
    delete sanitized.password;
    return sanitized;
};

const createUser = async (req, res) => {
    try {
        const { name, email, phone_no, password, role } = req.body;

        if (!name || !email || !phone_no || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            phone_no,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.status(201).json(sanitizeUser(newUser));
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        res.status(500).json({
            error: err.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json(users);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    }
    catch (err) {
        if (isInvalidObjectId(err)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            error: err.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    }
    catch (err) {
        if (isInvalidObjectId(err)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            error: err.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });
    }
    catch (err) {
        if (isInvalidObjectId(err)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            error: err.message
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
