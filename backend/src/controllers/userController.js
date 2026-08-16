const User = require("../models/User");

const createUser = async (req, res) => {
    try {
        const { name, email, phone_no, password, role } = req.body;

        const newUser = new User({
            name,
            email,
            phone_no,
            password,
            role
        });

        await newUser.save();

        res.status(201).json(newUser);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();

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
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    }
    catch (err) {
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