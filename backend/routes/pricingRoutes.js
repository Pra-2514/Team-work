const express = require("express");
const router = express.Router();
const pricingController = require("../controllers/pricingController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", pricingController.getPricings);

// Protected routes (Owner only)
router.post("/", auth, requireRole(["owner"]), pricingController.createPricing);
router.put("/:id", auth, requireRole(["owner"]), pricingController.updatePricing);
router.delete("/:id", auth, requireRole(["owner"]), pricingController.deletePricing);

module.exports = router;
