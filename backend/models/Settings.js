const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    companyDetails: {
      name: { type: String, default: "Code Adda" },
      tagline: { type: String, default: "Where Code Meets Creativity" },
      email: { type: String, default: "hello@codeadda.dev" },
      phone: { type: String, default: "+91 98765 43210" },
      location: { type: String, default: "Remote · Serving Clients Worldwide" },
      pitch: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    websiteSettings: {
      enableServices: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", SettingsSchema);
