const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const { sendResponse } = require("../utils/response");
const validateMongodb_ID = require("../utils/validateMongodb_ID");
const AdminUnit = require("../models/adminUnit.model");

const createAdminUnit = asyncWrapper(async (req, res, next) => {
  const { name, description, staff, college, university } = req.body;
  if (!name || !description) {
    throw appError.create(400, "Missing required fields");
  }

  if ((college && university) || (!college && !university)) {
    throw appError.create(
      "Specify exactly one of college or university",
      400,
      httpStatusText.FAIL
    );
  }

  if (staff) {
    if (!Array.isArray(staff)) {
      throw appError.create(400, "Staff must be an array of user IDs");
    }
    staff.forEach((userId) => validateMongodb_ID(userId));
  }
    //   validateMongodb_ID(staff);
    
  if (college) validateMongodb_ID(college);
  if (university) validateMongodb_ID(university);
    
  //   if (staff && !Array.isArray(staff)) {
  //     throw appError.create(400, "Staff must be an array of user IDs");
  //   }
  //   if (staff) {
  //     staff.forEach((userId) => validateMongodb_ID(userId));
  //     }

  const existingUnit = await AdminUnit.findOne({
    name: name.trim(),
    ...(college ? { college } : { university }),
  });

  if (existingUnit) {
    throw appError.create(
      409,
      `An Admin Unit with the name '${name}' already exists in this ${
        college ? "college" : "university"
      }.`,
      httpStatusText.FAIL
    );
  }
  const newAdminUnit = await AdminUnit.create({
    name,
    description,
    staff,
    college: college || undefined,
    university: university || undefined,
  });
  res.status(201).json({
    statusText: httpStatusText.SUCCESS,
    message: "Admin Unit created successfully",
    data: newAdminUnit,
  });
  //     sendResponse(res, {
  //     statusCode: 201,
  //     statusText: httpStatusText.SUCCESS,
  //     message: "Admin Unit created successfully",
  //     data: newAdminUnit,
  //   });
});


const getAllAdminUnits = asyncWrapper(async (req, res) => {
  // Basic Filtering
  let queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Advanced Filtering (e.g., gte, lte)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

  // Build query
  let query = AdminUnit.find(JSON.parse(queryStr))
    .populate("staff", "firstname lastname email role")
    .populate("college", "name code")
    .populate("university", "name code");

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const totalDocuments = await AdminUnit.countDocuments(JSON.parse(queryStr));
  const totalPages = Math.ceil(totalDocuments / limit);

  if (req.query.page && skip >= totalDocuments) {
    throw appError.create(404, "This page does not exist");
  }

  const adminUnits = await query;

    res.status(200).json({
    message:"AdminUnits retrieved successfully",
    status: httpStatusText.SUCCESS,
    results: adminUnits.length,
    page,
    totalPages,
    data: adminUnits,
  });
    
// sendResponse(res, 200, "AdminUnits retrieved successfully", { results: adminUnits.length, page, totalPages, adminUnits });

});

const getAdminUnitById = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongodb_ID(id);

  // Find AdminUnit by ID and populate references
  const adminUnit = await AdminUnit.findById(id)
    .populate("staff", "firstname lastname email role")
    .populate("college", "name code")
    .populate("university", "name code");

  // If not found, throw 404
  if (!adminUnit) {
    throw appError.create(404, "Admin Unit not found", httpStatusText.FAIL);
  }

  // Send response
  res.status(200).json({
    message: "Admin Unit retrieved successfully",
    status: httpStatusText.SUCCESS,
    data: adminUnit,
  });
});



const updateAdminUnit = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { name, description, staff, college, university } = req.body;

  validateMongodb_ID(id);

  if ((college && university) || (!college && !university)) {
    throw appError.create(
      400,
      "Specify exactly one of college or university",
      httpStatusText.FAIL
    );
  }

  if (staff) {
    if (!Array.isArray(staff)) {
      throw appError.create(400, "Staff must be an array of user IDs");
    }
    staff.forEach(validateMongodb_ID);
  }
  if (college) validateMongodb_ID(college);
  if (university) validateMongodb_ID(university);

  if (name) {
    const duplicateUnit = await AdminUnit.findOne({
      _id: { $ne: id },
      name: name.trim(),
      ...(college ? { college } : { university }),
    });

    if (duplicateUnit) {
      throw appError.create(
        409,
        `An Admin Unit with the name '${name}' already exists in this ${college ? "college" : "university"}.`,
        httpStatusText.FAIL
      );
    }
  }

//  const updateData = {};

// if (name) updateData.name = name;
// if (description) updateData.description = description;
// if (staff) updateData.staff = staff;
// if (college) {
//   updateData.college = college;
//   updateData.university = undefined;
// }
// if (university) {
//   updateData.university = university;
//   updateData.college = undefined;
// }

// const updatedAdminUnit = await AdminUnit.findByIdAndUpdate(
//   id,
//   updateData,
//   { new: true, runValidators: true }
// )   
    
  const updatedAdminUnit = await AdminUnit.findByIdAndUpdate(
    id,
    {
      ...(name && { name }),
      ...(description && { description }),
      ...(staff && { staff }),
      college: college || undefined,
      university: university || undefined,
    },
    { new: true, runValidators: true }
  )
    .populate("staff", "firstname lastname email role")
    .populate("college", "name code")
    .populate("university", "name code");

  if (!updatedAdminUnit) {
    throw appError.create(404, "Admin Unit not found", httpStatusText.FAIL);
  }

  //  Send response
  res.status(200).json({
    message: "Admin Unit updated successfully",
    status: httpStatusText.SUCCESS,
    data: updatedAdminUnit,
  });
});


const deleteAdminUnit = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  validateMongodb_ID(id);

  const deleted = await AdminUnit.findByIdAndDelete(id);

  if (!deleted) {
    throw appError.create(404, "Admin Unit not found", httpStatusText.FAIL);
  }

  res.status(204).json({
    status: httpStatusText.SUCCESS,
    message: "Admin Unit deleted successfully",
    data: null,
  });
});


module.exports = {
  createAdminUnit,
  getAllAdminUnits,
  getAdminUnitById,
  updateAdminUnit,
  deleteAdminUnit,
};
