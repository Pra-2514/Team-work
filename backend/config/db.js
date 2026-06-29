const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error("MONGO_URI is missing in .env file");
      process.exit(1);
    }

    if (mongoURI.includes("<db_password>") || mongoURI.includes("YOUR_REAL_PASSWORD")) {
      console.error("MONGO_URI still contains a placeholder password. Update .env first.");
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB Atlas Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;