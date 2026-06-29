const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
  {
    projectRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRequest",
      required: [true, "Project request reference is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender reference is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
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

module.exports = mongoose.model("Reply", ReplySchema);
