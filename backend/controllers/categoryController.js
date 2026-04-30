const Category = require('../models/Category');
const { createError } = require('../utils/apiError');
const { sendResponse } = require('../utils/apiResponse');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('blogCount')
      .sort('name')
      .lean();
    sendResponse(res, 200, { categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return next(createError(404, 'Category not found.'));
    sendResponse(res, 200, { category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;
    const category = await Category.create({ name, description, color, icon });
    sendResponse(res, 201, { category }, 'Category created');
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) return next(createError(404, 'Category not found.'));
    sendResponse(res, 200, { category }, 'Category updated');
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(createError(404, 'Category not found.'));
    sendResponse(res, 200, {}, 'Category deleted');
  } catch (error) {
    next(error);
  }
};
