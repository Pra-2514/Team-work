const Payment = require("../models/Payment");
const ProjectRequest = require("../models/ProjectRequest");

// @desc    Create an invoice for a project (Owner/Admin)
// @route   POST /api/payments/invoice
// @access  Private (Owner/Admin Only)
exports.createInvoice = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod } = req.body;
    if (!projectId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Project ID and amount are required.",
      });
    }

    const project = await ProjectRequest.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project request not found.",
      });
    }

    // Generate random invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      projectRequest: projectId,
      client: project.client,
      amount,
      invoiceNumber,
      paymentMethod: paymentMethod || "upi",
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payments (filtered by role)
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "client") {
      query.client = req.user.id;
    }

    const payments = await Payment.find(query)
      .populate("projectRequest", "title service status")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully.",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update payment status/transaction details
// @route   PUT /api/payments/:id
// @access  Private
exports.updatePayment = async (req, res) => {
  try {
    const { paymentStatus, transactionId, paymentMethod, receipt } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    // Client can submit transaction ID and complete payment (mock upload receipt)
    // Owner/Admin can approve/complete or reject payment status
    if (req.user.role === "client") {
      if (payment.client.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Forbidden." });
      }
      if (transactionId) payment.transactionId = transactionId;
      if (paymentMethod) payment.paymentMethod = paymentMethod;
      if (receipt) payment.receipt = receipt;
      // Mark as completed mock
      payment.paymentStatus = "completed"; 
    } else {
      // Owner/Admin overrides
      if (paymentStatus) payment.paymentStatus = paymentStatus;
      if (transactionId) payment.transactionId = transactionId;
      if (receipt) payment.receipt = receipt;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment updated successfully.",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
