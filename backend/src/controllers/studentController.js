const Student = require("../models/Student");
const User = require("../models/User");

const getStudentProfile = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can access student profile"
            });
        }

        const user = await User.findById(req.user.userId).select(
            "name email phone_no role"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const student = await Student.findOne({
            userId: req.user.userId
        });

        res.status(200).json({
            user,
            student
        });

    } catch (error) {
        console.error("Get Student Profile Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const createStudentProfile = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create student profile"
            });
        }

        const existingStudent = await Student.findOne({
            userId: req.user.userId
        });

        if (existingStudent) {
            return res.status(409).json({
                message: "Student profile already exists"
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const {
            college,
            course,
            year,
            gender,
            city,
            preferredLocation,
            maxRent,
            roomType,
            foodRequired,
            acRequired
        } = req.body;

        const student = await Student.create({
            userId: user._id,
            college,
            course,
            year,
            gender,
            city,
            preferredLocation,
            maxRent,
            roomType,
            foodRequired,
            acRequired
        });

        res.status(201).json({
            message: "Student profile created successfully",
            student
        });

    } catch (error) {
        console.error("Create Student Profile Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updateStudentProfile = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can update student profile"
            });
        }

        const student = await Student.findOne({
            userId: req.user.userId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        const {
            college,
            course,
            year,
            gender,
            city,
            preferredLocation,
            maxRent,
            roomType,
            foodRequired,
            acRequired
        } = req.body;

        if (college !== undefined) {
            student.college = college;
        }

        if (course !== undefined) {
            student.course = course;
        }

        if (year !== undefined) {
            student.year = year;
        }

        if (gender !== undefined) {
            student.gender = gender;
        }

        if (city !== undefined) {
            student.city = city;
        }

        if (preferredLocation !== undefined) {
            student.preferredLocation = preferredLocation;
        }

        if (maxRent !== undefined) {
            student.maxRent = maxRent;
        }

        if (roomType !== undefined) {
            student.roomType = roomType;
        }

        if (foodRequired !== undefined) {
            student.foodRequired = foodRequired;
        }

        if (acRequired !== undefined) {
            student.acRequired = acRequired;
        }

        await student.save();

        res.status(200).json({
            message: "Student profile updated successfully",
            student
        });

    } catch (error) {
        console.error("Update Student Profile Error:", error.message);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getStudentProfile,
    createStudentProfile,
    updateStudentProfile
};