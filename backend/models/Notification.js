const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient reference is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRequest",
      default: null,
    },
    type: {
      type: String,
      enum: ["submitted", "approved", "assigned", "started", "completed", "reply", "general"],
      default: "general",
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
