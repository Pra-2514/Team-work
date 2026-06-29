const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", categoryController.getCategories);

// Protected routes (Owner only)
router.post("/", auth, requireRole(["owner"]), categoryController.createCategory);

module.exports = router;
