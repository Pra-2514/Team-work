const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    projectRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRequest",
      required: [true, "Project request reference is required"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
    },
    qrCodePlaceholder: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=codeadda@upi", // Mock QR generator API
    },
    scannerPlaceholder: {
      type: String,
      default: "https://codeadda.dev/scanner-placeholder.png",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash", "other"],
      default: "upi",
    },
    receipt: {
      type: String, // Receipt URL or details
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", PaymentSchema);
