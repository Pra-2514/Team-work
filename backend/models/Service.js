const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
    },
    estimatedDelivery: {
      type: String,
      required: [true, "Estimated delivery time is required"],
    },
    technologies: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", ServiceSchema);
