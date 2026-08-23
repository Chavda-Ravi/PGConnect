const express = require("express");

const router = express.Router();

const {
    getAllPGs,
    getPGById,
    searchPGs
} = require("../controllers/pgDiscoveryController");

router.get("/", getAllPGs);

router.get("/search", searchPGs);

router.get("/:id", getPGById);

module.exports = router;