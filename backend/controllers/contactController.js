const ContactMessage = require("../models/ContactMessage");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and message.",
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      service: service || "",
      message,
      status: "unread",
    });

    // Notify Owner/Admin of new contact message
    const admins = await User.find({ role: { $in: ["owner", "admin"] } });
    const notificationPromises = admins.map((admin) =>
      Notification.create({
        recipient: admin._id,
        message: `New contact message from ${name} (${email})`,
        type: "general",
      })
    );
    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: `Thanks! We have received your message. We'd reach out to ${email} soon.`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Owner/Admin)
exports.getContactMessages = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const messages = await ContactMessage.find(query)
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully.",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update contact message (assign, reply, mark read)
// @route   PUT /api/contact/:id
// @access  Private (Owner/Admin)
exports.updateContactMessage = async (req, res) => {
  try {
    const { status, assignedTo, replyMessage } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    if (status) {
      message.status = status;
    }

    if (assignedTo !== undefined) {
      message.assignedTo = assignedTo || null;
      if (assignedTo) {
        // Notify the assigned user
        const assignee = await User.findById(assignedTo);
        if (assignee) {
          await Notification.create({
            recipient: assignee._id,
            message: `A contact inquiry from ${message.name} was assigned to you.`,
            type: "general",
          });
        }
      }
    }

    if (replyMessage !== undefined) {
      message.replyMessage = replyMessage;
      message.status = "replied";
      message.repliedAt = new Date();

      // In real-world, we would send email here.
      console.log(`Sending email response to ${message.email}: ${replyMessage}`);
    }

    await message.save();
    const populated = await message.populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      message: "Contact message updated successfully.",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Owner Only)
exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
