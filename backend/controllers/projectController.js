const ProjectRequest = require("../models/ProjectRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

// Helper to recommend project type
const getRecommendation = (serviceName = "") => {
  const name = serviceName.toLowerCase();
  if (name.includes("website") || name.includes("web") || name.includes("ecommerce")) {
    return "Full Stack Website";
  }
  if (name.includes("ai") || name.includes("automation") || name.includes("machine learning")) {
    return "Machine Learning Project";
  }
  if (name.includes("video") || name.includes("editing") || name.includes("graphic") || name.includes("design")) {
    return "Creative Media";
  }
  if (name.includes("research") || name.includes("paper") || name.includes("journal") || name.includes("academic")) {
    return "Academic Research";
  }
  return "General Digital Service";
};

// @desc    Submit a project request
// @route   POST /api/projects
// @access  Private (Client only)
exports.createProjectRequest = async (req, res) => {
  try {
    const { service, title, description, budget, timeline, referenceLinks, technologyRequired } = req.body;

    if (!service || !title || !description || !budget || !timeline) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (service, title, description, budget, timeline).",
      });
    }

    // Recommendation logic
    const recommendation = getRecommendation(service);

    // Get uploaded files paths if any
    const attachments = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const project = await ProjectRequest.create({
      client: req.user.id,
      service,
      title,
      description,
      budget,
      timeline,
      referenceLinks: referenceLinks ? (Array.isArray(referenceLinks) ? referenceLinks : [referenceLinks]) : [],
      technologyRequired: technologyRequired ? (Array.isArray(technologyRequired) ? technologyRequired : [technologyRequired]) : [],
      attachments,
      recommendation,
      status: "pending",
    });

    // Create Notification for Admins/Owners
    const admins = await User.find({ role: { $in: ["owner", "admin"] } });
    const notificationPromises = admins.map((admin) =>
      Notification.create({
        recipient: admin._id,
        message: `New project request submitted: "${title}" by ${req.user.name}`,
        project: project._id,
        type: "submitted",
      })
    );
    await Promise.all(notificationPromises);

    // Create Activity Log
    await ActivityLog.create({
      user: req.user.id,
      action: "PROJECT_SUBMITTED",
      details: `Client submitted project: "${title}"`,
    });

    res.status(201).json({
      success: true,
      message: "Thank you. Your request has been submitted successfully. Please wait for our developer's response.",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all project requests (filtered by role)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};
    const { status, search } = req.query;

    // Role-based filtering
    if (req.user.role === "client") {
      query.client = req.user.id;
    } else if (req.user.role === "developer") {
      query.assignedDeveloper = req.user.id;
    }

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await ProjectRequest.find(query)
      .populate("client", "name email phoneNumber")
      .populate("assignedDeveloper", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully.",
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.id)
      .populate("client", "name email phoneNumber")
      .populate("assignedDeveloper", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project request not found.",
      });
    }

    // Protection: clients can only view their own projects; developers only assigned ones
    if (req.user.role === "client" && project.client._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You cannot view this project.",
      });
    }

    if (req.user.role === "developer" && project.assignedDeveloper && project.assignedDeveloper._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You are not assigned to this project.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project details fetched successfully.",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update project (status, responses, developer assignments)
// @route   PUT /api/projects/:id
// @access  Private (Owner, Admin, Developer)
exports.updateProject = async (req, res) => {
  try {
    const { status, assignedDeveloper, developerResponse, ownerResponse } = req.body;
    const project = await ProjectRequest.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Role-based validations
    if (req.user.role === "developer") {
      // Developers can only update status (to started/completed) and write dev responses for their ASSIGNED projects
      if (!project.assignedDeveloper || project.assignedDeveloper.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You are not assigned to this project.",
        });
      }
      if (status && !["started", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Developers can only update status to 'started' or 'completed'.",
        });
      }
      if (ownerResponse || assignedDeveloper) {
        return res.status(403).json({
          success: false,
          message: "Developers cannot assign team members or modify owner responses.",
        });
      }
    }

    // Owner and Admin can modify everything. Admin cannot change Owner response if Owner set it (optional rule, let's keep it clean: Admin has wide edit access but Owner has highest).
    // Let's implement status transitions and notifications
    let notificationMsg = "";
    let notificationType = "";

    if (status && status !== project.status) {
      project.status = status;
      notificationType = status === "approved" ? "approved" : (status === "started" ? "started" : (status === "completed" ? "completed" : "general"));
      notificationMsg = `Your project "${project.title}" has been ${status}.`;
    }

    if (assignedDeveloper !== undefined) {
      // Only Owner/Admin can change assignment
      if (req.user.role === "developer") {
        return res.status(403).json({ success: false, message: "Developers cannot change assignments." });
      }
      project.assignedDeveloper = assignedDeveloper || null;
      if (assignedDeveloper) {
        const devUser = await User.findById(assignedDeveloper);
        if (devUser) {
          // Notify Developer
          await Notification.create({
            recipient: devUser._id,
            message: `You have been assigned to project "${project.title}".`,
            project: project._id,
            type: "assigned",
          });
        }
        notificationMsg = `A developer has been assigned to your project "${project.title}".`;
        notificationType = "assigned";
      }
    }

    if (developerResponse !== undefined) {
      project.developerResponse = developerResponse;
    }

    if (ownerResponse !== undefined) {
      if (req.user.role === "developer") {
        return res.status(403).json({ success: false, message: "Developers cannot change owner response." });
      }
      project.ownerResponse = ownerResponse;
    }

    await project.save();

    // Notify Client of project updates
    if (notificationMsg) {
      await Notification.create({
        recipient: project.client,
        message: notificationMsg,
        project: project._id,
        type: notificationType,
      });
    }

    // Log Activity
    await ActivityLog.create({
      user: req.user.id,
      action: "PROJECT_UPDATED",
      details: `Project "${project.title}" updated status to ${project.status} by ${req.user.name}`,
    });

    const populatedProject = await project
      .populate("client", "name email phoneNumber")
      .populate("assignedDeveloper", "name email role");

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: populatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload project attachments/progress files
// @route   POST /api/projects/:id/upload
// @access  Private (Client, Developer, Owner, Admin)
exports.uploadProgressFile = async (req, res) => {
  try {
    const project = await ProjectRequest.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Access control
    if (req.user.role === "client" && project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    if (req.user.role === "developer" && project.assignedDeveloper?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded.",
      });
    }

    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
    project.attachments.push(...fileUrls);
    await project.save();

    // Create Notification
    const notifyRecipient = req.user.role === "client" 
      ? (project.assignedDeveloper || project.client) // Notify dev if assigned, otherwise client itself
      : project.client;

    if (notifyRecipient && notifyRecipient.toString() !== req.user.id) {
      await Notification.create({
        recipient: notifyRecipient,
        message: `${req.user.name} uploaded new progress files to "${project.title}".`,
        project: project._id,
        type: "general",
      });
    }

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully.",
      data: project.attachments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
