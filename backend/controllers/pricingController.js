const Pricing = require("../models/Pricing");

// @desc    Get all pricing plans
// @route   GET /api/pricing
// @access  Public
exports.getPricings = async (req, res) => {
  try {
    const pricingPlans = await Pricing.find();
    res.status(200).json({
      success: true,
      message: "Pricing plans fetched successfully.",
      data: pricingPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new pricing plan
// @route   POST /api/pricing
// @access  Private (Owner Only)
exports.createPricing = async (req, res) => {
  try {
    const { name, price, period, tagline, features, accent, highlight } = req.body;

    if (!name || !price || !period) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, price, period).",
      });
    }

    const pricing = await Pricing.create({
      name,
      price,
      period,
      tagline: tagline || "",
      features: features || [],
      accent: accent || "#00F0FF",
      highlight: highlight || false,
    });

    res.status(201).json({
      success: true,
      message: "Pricing plan created successfully.",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a pricing plan
// @route   PUT /api/pricing/:id
// @access  Private (Owner Only)
exports.updatePricing = async (req, res) => {
  try {
    const { name, price, period, tagline, features, accent, highlight } = req.body;
    const pricing = await Pricing.findById(req.params.id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Pricing plan not found.",
      });
    }

    if (name) pricing.name = name;
    if (price) pricing.price = price;
    if (period) pricing.period = period;
    if (tagline !== undefined) pricing.tagline = tagline;
    if (features) pricing.features = features;
    if (accent) pricing.accent = accent;
    if (highlight !== undefined) pricing.highlight = highlight;

    await pricing.save();

    res.status(200).json({
      success: true,
      message: "Pricing plan updated successfully.",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a pricing plan
// @route   DELETE /api/pricing/:id
// @access  Private (Owner Only)
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Pricing plan not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pricing plan deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
