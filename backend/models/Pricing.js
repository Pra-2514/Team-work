const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pricing package name is required"],
      unique: true,
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price value is required"],
    },
    period: {
      type: String,
      required: [true, "Pricing period is required"],
    },
    tagline: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    accent: {
      type: String,
      default: "#00F0FF",
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pricing", PricingSchema);
