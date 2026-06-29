const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const replyController = require("../controllers/replyController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", auth, projectController.getProjects);
router.get("/:id", auth, projectController.getProjectById);

// Submit project request with optional attachments
router.post(
  "/",
  auth,
  upload.array("attachments", 5),
  projectController.createProjectRequest
);

// Update status/assignment
router.put("/:id", auth, projectController.updateProject);

// Upload progress files to a project
router.post(
  "/:id/upload",
  auth,
  upload.array("files", 5),
  projectController.uploadProgressFile
);

// Threaded communication replies
router.get("/:projectId/replies", auth, replyController.getReplies);
router.post("/:projectId/replies", auth, replyController.createReply);

module.exports = router;
