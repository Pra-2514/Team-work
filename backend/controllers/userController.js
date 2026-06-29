const User = require("../models/User");

// @desc    Get all users (Owner only)
// @route   GET /api/users
// @access  Private (Owner Only)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user details/role (Owner only)
// @route   PUT /api/users/:id
// @access  Private (Owner Only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phoneNumber, bio } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Owner cannot change their own role or delete themselves
    if (user._id.toString() === req.user.id && role && role !== "owner") {
      return res.status(400).json({
        success: false,
        message: "Owner cannot demote themselves.",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (Owner only)
// @route   DELETE /api/users/:id
// @access  Private (Owner Only)
exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Owner cannot delete themselves
    if (userToDelete._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot delete their own account.",
      });
    }

    // Admin/Owner delete safety check: Cannot delete an Owner account
    if (userToDelete.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "Action forbidden. Owner account cannot be deleted.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
