const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

router.post("/", contactController.createContactMessage);

// Protected routes (Owner / Admin only)
router.get("/", auth, requireRole(["owner", "admin"]), contactController.getContactMessages);
router.put("/:id", auth, requireRole(["owner", "admin"]), contactController.updateContactMessage);
router.delete("/:id", auth, requireRole(["owner"]), contactController.deleteContactMessage);

module.exports = router;
