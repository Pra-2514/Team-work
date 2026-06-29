const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getServiceById);

// Protected routes (Owner only)
router.post("/", auth, requireRole(["owner"]), serviceController.createService);
router.put("/:id", auth, requireRole(["owner"]), serviceController.updateService);
router.delete("/:id", auth, requireRole(["owner"]), serviceController.deleteService);

module.exports = router;
