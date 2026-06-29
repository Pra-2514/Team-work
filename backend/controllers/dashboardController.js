const User = require("../models/User");
const ProjectRequest = require("../models/ProjectRequest");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const ActivityLog = require("../models/ActivityLog");
const ContactMessage = require("../models/ContactMessage");

// @desc    Get Owner analytics dashboard data
// @route   GET /api/dashboard/owner
// @access  Private (Owner Only)
exports.getOwnerDashboard = async (req, res) => {
  try {
    // 1. Total Revenue
    const completedPayments = await Payment.find({ paymentStatus: "completed" });
    const totalRevenue = completedPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Project counts by status
    const pendingProjects = await ProjectRequest.countDocuments({ status: "pending" });
    const approvedProjects = await ProjectRequest.countDocuments({ status: "approved" });
    const startedProjects = await ProjectRequest.countDocuments({ status: "started" });
    const completedProjects = await ProjectRequest.countDocuments({ status: "completed" });

    // 3. User counts by role
    const totalClients = await User.countDocuments({ role: "client" });
    const totalDevelopers = await User.countDocuments({ role: "developer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // 4. Services Count
    const totalServices = await Service.countDocuments();

    // 5. Recent Activity Logs (latest 10)
    const logs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ timestamp: -1 })
      .limit(10);

    // 6. Recent Projects
    const recentProjects = await ProjectRequest.find()
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Owner dashboard analytics fetched successfully.",
      data: {
        revenue: totalRevenue,
        projects: {
          pending: pendingProjects,
          approved: approvedProjects,
          started: startedProjects,
          completed: completedProjects,
          total: pendingProjects + approvedProjects + startedProjects + completedProjects,
        },
        users: {
          clients: totalClients,
          developers: totalDevelopers,
          admins: totalAdmins,
        },
        totalServices,
        recentActivities: logs,
        recentProjects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Admin dashboard details
// @route   GET /api/dashboard/admin
// @access  Private (Owner/Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: "client" });
    const totalProjects = await ProjectRequest.countDocuments();
    const contactMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);
    const projects = await ProjectRequest.find()
      .populate("client", "name email")
      .populate("assignedDeveloper", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully.",
      data: {
        totalClients,
        totalProjects,
        recentContactMessages: contactMessages,
        projects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Developer dashboard details
// @route   GET /api/dashboard/developer
// @access  Private (Developer Only)
exports.getDeveloperDashboard = async (req, res) => {
  try {
    const assignedProjects = await ProjectRequest.find({ assignedDeveloper: req.user.id })
      .populate("client", "name email phoneNumber")
      .sort({ updatedAt: -1 });

    const totalAssigned = assignedProjects.length;
    const completedProjects = assignedProjects.filter((p) => p.status === "completed").length;
    const activeProjects = totalAssigned - completedProjects;

    res.status(200).json({
      success: true,
      message: "Developer dashboard data fetched successfully.",
      data: {
        totalAssigned,
        activeProjects,
        completedProjects,
        projects: assignedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all Activity Logs
// @route   GET /api/dashboard/logs
// @access  Private (Owner Only)
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("user", "name email role")
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      message: "Activity logs fetched successfully.",
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
