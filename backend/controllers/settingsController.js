const Settings = require("../models/Settings");

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      message: "Settings fetched successfully.",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private (Owner Only)
exports.updateSettings = async (req, res) => {
  try {
    const { companyDetails, websiteSettings } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (companyDetails) {
      settings.companyDetails = {
        ...settings.companyDetails,
        ...companyDetails,
      };
    }

    if (websiteSettings) {
      settings.websiteSettings = {
        ...settings.websiteSettings,
        ...websiteSettings,
      };
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
