const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    company: {
      type: String,
      default: "",
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Testimonial", TestimonialSchema);
