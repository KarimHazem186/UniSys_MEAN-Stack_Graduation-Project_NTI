const Program = require("../models/program.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const { sendResponse } = require("../utils/response");
const validateMongodb_ID = require("../utils/validateMongodb_ID");
const Course = require("../models/course.model");

const createProgram = asyncWrapper(async (req, res) => {
  const { name, code, type, durationYears, college, department, courses } =
    req.body;
  if (!name || !code || !type || !college) {
    throw appError.create(400, "Missing required fields");
  }
  // Check if code already exists
  const existingProgram = await Program.findOne({ code: code.toUpperCase() });
  if (existingProgram) {
    throw appError.create("Program with this code already exists", 409);
  }
  validateMongodb_ID(college);
  if (department) {
    validateMongodb_ID(department);
  }
  if (courses && !Array.isArray(courses)) {
    throw appError.create(400, "Courses must be an array of course IDs");
  }
  if (courses) {
    courses.forEach((courseId) => validateMongodb_ID(courseId));
  }
  const newProgram = await Program.create({
    name,
    code: code.toUpperCase(),
    type,
    durationYears,
    college,
    department,
    courses,
  });

  // Optionally, you can add the program to the courses' programs array
  if (courses) {
    await Course.updateMany(
      { _id: { $in: courses } },
      { $push: { programs: newProgram._id } }
    );
  }

  res.status(201).json({
    status: "success",
    message: "Program created successfully",
    data: newProgram,
  });
//   sendResponse(res, 201, "Program created successfully", newProgram);
});


// GET /api/programs?college=64f7b19f5d8722341fcbbf93&sort=name&fields=name,code,createdAt&page=1&limit=5
// Get all programs with optional filtering, sorting, and pagination
const getAllPrograms = asyncWrapper(async (req, res) => {
  let queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|nin|ne)\b/g,
    (match) => `$${match}`
  );
  queryObj = JSON.parse(queryStr);

  let query = Program.find(queryObj).populate("college").populate("department");

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field limiting
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

  const programs = await query;
  res.status(200).json({
    status: "success",
    results: programs.length,
    data: programs,
  });
 // sendResponse(res, 200, "Programs retrieved successfully", programs);
});

// GET /api/programs/:id
// Get a single program by ID
const getProgramById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const program = await Program.findById(id)
    .populate("college")
    .populate("department")
    .populate("courses");
  if (!program) {
    throw appError.create(404, "Program not found");
  }
  res.status(200).json({
    status: "success",
    data: program,
  });
 // sendResponse(res, 200, "Program retrieved successfully", program);
});


// PATCH /api/programs/:id
// Update a program by ID
const updateProgramById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const { name, code, type, durationYears, college, department, courses } =
    req.body;
  if (code) {
    // Check if code already exists
    const existingProgram = await Program.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingProgram) {
      throw appError.create("Program with this code already exists", 409);
    }
  }
  if (college) {
    validateMongodb_ID(college);
  }
  if (department) {
    validateMongodb_ID(department);
  }
  if (courses && !Array.isArray(courses)) {
    throw appError.create(400, "Courses must be an array of course IDs");
  }
  if (courses) {
    courses.forEach((courseId) => validateMongodb_ID(courseId));
  }

  const updatedData = {
    ...(name && { name }),
    ...(code && { code: code.toUpperCase() }),
    ...(type && { type }),
    ...(durationYears && { durationYears }),
    ...(college && { college }),
    ...(department && { department }),
    ...(courses && { courses }),
  };

  const updatedProgram = await Program.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedProgram) {
    throw appError.create(404, "Program not found");
  }

  //  update the programs array in the Course model
  if (courses) {
    // Remove this program from all courses not in the new list
    await Course.updateMany(
      { programs: updatedProgram._id, _id: { $nin: courses } },
      { $pull: { programs: updatedProgram._id } }
    );
    // Add this program to the new courses
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { programs: updatedProgram._id } }
    );
  }

  res.status(200).json({
    status: "success",
    message: "Program updated successfully",
    data: updatedProgram,
  });
 // sendResponse(res, 200, "Program updated successfully", updatedProgram);
})


// DELETE /api/programs/:id
// Delete a program by ID
const deleteProgramById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const program = await Program.findByIdAndDelete(id);
  if (!program) {
    throw appError.create(404, "Program not found");
  }

  await Course.updateMany(
    { programs: program._id },
    { $pull: { programs: program._id } }
  );
  res.status(200).json({
    status: "success",
    message: "Program deleted successfully",
  });
 // sendResponse(res, 200, "Program deleted successfully", null);
});

// Get all programs by department
const getProgramsByDepartment = asyncWrapper(async (req, res) => {
  const { departmentId } = req.params;
  validateMongodb_ID(departmentId);
  const programs = await Program.find({ department: departmentId })
    .populate("college")
    .populate("department")
    .populate("courses");
  res.status(200).json({
    status: "success",
    results: programs.length,
    data: programs,
  });
 // sendResponse(res, 200, "Programs retrieved successfully", programs);
});

module.exports = {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgramById,
  deleteProgramById,
  getProgramsByDepartment
};