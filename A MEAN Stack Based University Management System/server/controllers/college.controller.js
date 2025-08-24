const College = require("../models/college.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { sendResponse } = require("../utils/response");
const validateMongodb_ID = require("../utils/validateMongodb_ID");

const createCollege = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    code,
    dean,
    departments,
    address,
    establishedYear,
    website,
  } = req.body;

  if (!name || !description || !code) {
    throw appError.create("Fields are required", 400);
  }
  const existingCollege = await College.findOne({ code: code.toUpperCase() });
  if (existingCollege) {
    throw appError.create("College with this code already exists", 409);
  }
  const newCollege = await College.create({
    name,
    description,
    code: code.toUpperCase(),
    dean,
    departments,
    address,
    establishedYear,
    website,
  });
  res.status(201).json({
    message: "College created successfully",
    data: newCollege,
  });
  // return sendResponse(res, 201, "College created successfully", newCollege);
});

const getAllColleges = asyncWrapper(async (req, res) => {
  const colleges = await College.find()
    .populate("dean", "firstname lastname email")
    .populate("departments","name code");
  res.status(200).json({
    message: "Colleges retrieved successfully",
    data: colleges,
  });
  //   return sendResponse(res, 200, "Colleges retrieved successfully", colleges);
});

const getCollegeById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const college = await College.findById(id)
    .populate("dean", "firstname lastname email")
    .populate("departments", "name code");
  if (!college) {
    throw appError.create("College not found", 404);
  }
  res.status(200).json({
    message: "College retrieved successfully",
    data: college,
  });
  //   return sendResponse(res, 200, "College retrieved successfully", college);
});

const updateCollege = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const {
    name,
    description,
    code,
    dean,
    departments,
    address,
    establishedYear,
    website,
  } = req.body;

  const college = await College.findById(id);
  if (!college) {
    throw appError.create("College not found", 404);
  }

  // Check for unique code if it's being updated
  if (code && code.toUpperCase() !== college.code) {
    const existingCollege = await College.findOne({ code: code.toUpperCase() });
    if (existingCollege) {
      throw appError.create("College with this code already exists", 409);
    }
    college.code = code.toUpperCase();
  }

  // Update other fields if provided
  if (name) college.name = name;
  if (description) college.description = description;
  if (dean) college.dean = dean;
  if (departments) college.departments = departments;
  if (address) college.address = address;
  if (establishedYear) college.establishedYear = establishedYear;
  if (website) college.website = website;

  const updatedCollege = await college.save();
  res.status(200).json({
    message: "College updated successfully",
    data: updatedCollege,
  });
  //   return sendResponse(res, 200, "College updated successfully", updatedCollege);
});


// Update College
// const updateCollege = asyncWrapper(async (req, res) => {
//   const { id } = req.params;
  
//   validateMongodb_ID(id);


//   const updates = { ...req.body };

//   if (updates.code) {
//     updates.code = updates.code.toUpperCase();
//     // Check if new code already exists on other college
//     const existing = await College.findOne({ code: updates.code, _id: { $ne: id } });
//     if (existing) {
//       throw appError.create("College code already in use", 409);
//     }
//   }

//   const updatedCollege = await College.findByIdAndUpdate(id, updates, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedCollege) {
//     throw appError.create("College not found", 404);
//   }

//   res.status(200).json({
//     message: "College updated successfully",
//     data: updatedCollege,
//   });
// });


const deleteCollege = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const college = await College.findByIdAndDelete(id);
  if (!college) {
    throw appError.create("College not found", 404);
  }
  res.status(200).json({
    message: "College deleted successfully",
    data: college,
  });
  //   return sendResponse(res, 200, "College deleted successfully", college);
});

module.exports = {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
