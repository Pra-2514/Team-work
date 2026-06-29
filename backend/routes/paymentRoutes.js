const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.get("/", auth, paymentController.getPayments);
router.put("/:id", auth, paymentController.updatePayment);

// Owner/Admin only invoice creation
router.post("/invoice", auth, requireRole(["owner", "admin"]), paymentController.createInvoice);

module.exports = router;
