const express = require("express");

const router = express.Router();

const {
    createInquiry,
    getMyInquiries,
    getOwnerInquiries,
    respondToInquiry
} = require("../controllers/inquiryController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createInquiry);

router.get("/student", authMiddleware, getMyInquiries);

router.get("/owner", authMiddleware, getOwnerInquiries);

router.put("/:id/respond", authMiddleware, respondToInquiry);

module.exports = router;