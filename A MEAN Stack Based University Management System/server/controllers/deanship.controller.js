// controllers/deanship.controller.js
const Deanship = require("../models/deanship.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");

// Create new deanship
exports.createDeanship = asyncWrapper(async (req, res) => {
  const deanship = await Deanship.create(req.body);
  res.status(201).json({
    status: "success",
    data: deanship,
  });
});

// Get all deanships
exports.getAllDeanships = asyncWrapper(async (req, res) => {
  const deanships = await Deanship.find()
    .populate("dean", "firstName lastName email role")
    .populate("college", "name code");

  res.status(200).json({
    status: "success",
    results: deanships.length,
    data: deanships,
  });
});

// Get single deanship
exports.getDeanshipById = asyncWrapper(async (req, res, next) => {
  const deanship = await Deanship.findById(req.params.id)
    .populate("dean", "firstName lastName email role")
    .populate("college", "name code");

  if (!deanship) return next(appError.create(404, "Deanship not found"));

  res.status(200).json({
    status: "success",
    data: deanship,
  });
});
