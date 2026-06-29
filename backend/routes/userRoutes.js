const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

// Protect all routes to Owner only
router.use(auth, requireRole(["owner"]));

router.get("/", userController.getUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
