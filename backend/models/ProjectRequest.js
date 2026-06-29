const mongoose = require("mongoose");

const ProjectRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
    },
    service: {
      type: String,
      required: [true, "Selected service is required"],
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    budget: {
      type: String,
      required: [true, "Project budget target is required"],
    },
    timeline: {
      type: String,
      required: [true, "Project timeline is required"],
    },
    referenceLinks: {
      type: [String],
      default: [],
    },
    technologyRequired: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      default: "",
    },
    assignedDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "started", "completed"],
      default: "pending",
    },
    developerResponse: {
      type: String,
      default: "",
    },
    ownerResponse: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectRequest", ProjectRequestSchema);
