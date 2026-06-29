const Reply = require("../models/Reply");
const ProjectRequest = require("../models/ProjectRequest");
const Notification = require("../models/Notification");

// @desc    Get all replies/messages for a project request
// @route   GET /api/projects/:projectId/replies
// @access  Private (Participants only)
exports.getReplies = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project request not found.",
      });
    }

    // Access control
    if (req.user.role === "client" && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    if (req.user.role === "developer" && project.assignedDeveloper?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const replies = await Reply.find({ projectRequest: req.params.projectId })
      .populate("sender", "name email role profilePicture")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 }); // Oldest first (thread order)

    // Mark replies as read where current user is receiver
    await Reply.updateMany(
      { projectRequest: req.params.projectId, receiver: req.user.id, seen: false },
      { seen: true }
    );

    res.status(200).json({
      success: true,
      message: "Replies fetched successfully.",
      data: replies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send a reply/message in project thread
// @route   POST /api/projects/:projectId/replies
// @access  Private (Participants only)
exports.createReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message content is required.",
      });
    }

    const project = await ProjectRequest.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project request not found.",
      });
    }

    // Access control
    if (req.user.role === "client" && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    if (req.user.role === "developer" && project.assignedDeveloper?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    // Determine receiver
    let receiver = null;
    if (req.user.role === "client") {
      // Receiver is the assigned developer, or if none, the Owner (find first owner in DB)
      if (project.assignedDeveloper) {
        receiver = project.assignedDeveloper;
      } else {
        // Fallback to Owner
        const owner = await require("../models/User").findOne({ role: "owner" });
        if (owner) receiver = owner._id;
      }
    } else {
      // If developer, admin or owner replies, the receiver is the client
      receiver = project.client;
    }

    const reply = await Reply.create({
      projectRequest: req.params.projectId,
      sender: req.user.id,
      receiver,
      message,
      seen: false,
    });

    // Create notification for the receiver
    if (receiver) {
      const typeLabel = req.user.role === "owner" ? "Owner Reply" : (req.user.role === "developer" ? "Developer Reply" : "Client Reply");
      
      await Notification.create({
        recipient: receiver,
        message: `New message on project "${project.title}" from ${req.user.name}`,
        project: project._id,
        type: req.user.role === "owner" ? "owner_reply" : (req.user.role === "developer" ? "developer_reply" : "reply"),
      });
    }

    const populatedReply = await reply.populate("sender", "name email role profilePicture");

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedReply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
