const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "codeadda_jwt_secret_key",
    { expiresIn: "1d" } // 1 day access token
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || "codeadda_jwt_refresh_key",
    { expiresIn: "7d" } // 7 days refresh token
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
