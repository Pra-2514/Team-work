const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/owner", auth, requireRole(["owner"]), dashboardController.getOwnerDashboard);
router.get("/admin", auth, requireRole(["owner", "admin"]), dashboardController.getAdminDashboard);
router.get("/developer", auth, requireRole(["developer"]), dashboardController.getDeveloperDashboard);
router.get("/logs", auth, requireRole(["owner"]), dashboardController.getActivityLogs);

module.exports = router;
