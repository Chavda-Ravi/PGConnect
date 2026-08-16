const express = require("express");

const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, authorizeRoles("admin"), createUser);

router.get("/", authMiddleware, authorizeRoles("admin"), getUsers);

router.get("/:id", authMiddleware, authorizeRoles("admin"), getUserById);

router.put("/:id", authMiddleware, authorizeRoles("admin"), updateUser);

router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

module.exports = router;
