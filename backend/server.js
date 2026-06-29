const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const seedDatabase = require("./config/seeder");
const errorHandler = require("./middleware/errorHandler");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const projectRoutes = require("./routes/projectRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// MongoDB Connection & Seeding
// =======================
connectDB().then(() => {
  // Seed Database with initial data
  seedDatabase();
});

// =======================
// Mount API Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// Root route status check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Code Adda Backend Running Successfully 🚀",
  });
});

// =======================
// Global Error Handler
// =======================
app.use(errorHandler);

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});