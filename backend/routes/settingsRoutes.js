const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", settingsController.getSettings);
router.put("/", auth, requireRole(["owner"]), settingsController.updateSettings);

module.exports = router;
