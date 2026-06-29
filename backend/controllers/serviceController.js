const Service = require("../models/Service");
const Category = require("../models/Category");

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate("category", "name");
    res.status(200).json({
      success: true,
      message: "Services fetched successfully.",
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single service details
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("category", "name");
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Service fetched successfully.",
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Owner Only)
exports.createService = async (req, res) => {
  try {
    const { name, description, categoryId, startingPrice, estimatedDelivery, technologies, status } = req.body;

    if (!name || !description || !categoryId || !startingPrice || !estimatedDelivery) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const service = await Service.create({
      name,
      description,
      category: categoryId,
      startingPrice,
      estimatedDelivery,
      technologies: technologies || [],
      status: status || "active",
    });

    const populatedService = await service.populate("category", "name");

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      data: populatedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner Only)
exports.updateService = async (req, res) => {
  try {
    const { name, description, categoryId, startingPrice, estimatedDelivery, technologies, status } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
      service.category = categoryId;
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (startingPrice !== undefined) service.startingPrice = startingPrice;
    if (estimatedDelivery) service.estimatedDelivery = estimatedDelivery;
    if (technologies) service.technologies = technologies;
    if (status) service.status = status;

    await service.save();
    const populatedService = await service.populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      data: populatedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner Only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
