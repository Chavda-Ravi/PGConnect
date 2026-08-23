const express = require("express");

const router = express.Router();

const {
    getStudentProfile,
    createStudentProfile,
    updateStudentProfile
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
    "/profile",
    authMiddleware,
    authorizeRoles("student"),
    getStudentProfile
);

router.post(
    "/profile",
    authMiddleware,
    authorizeRoles("student"),
    createStudentProfile
);

router.put(
    "/profile",
    authMiddleware,
    authorizeRoles("student"),
    updateStudentProfile
);

module.exports = router;