const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication required.",
      });
    }

    // Owner automatically has full access to every role-restricted endpoint
    if (req.user.role === "owner") {
      return next();
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to roles: [${roles.join(", ")}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = requireRole;
