const Department = require("../models/department.model");
const College = require("../models/college.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const { sendResponse } = require("../utils/response");
const validateMongodb_ID = require("../utils/validateMongodb_ID");

// Create a new department
const createDepartment = asyncWrapper(async (req, res) => {
  const { name, description, code, college, headOfDepartment, courses } =
    req.body;
  if (!name || !code || !college || !headOfDepartment) {
    throw appError.create(400, "Missing required fields");
  }
  // Check if code already exists
  const existingDepartment = await Department.findOne({
    code: code.toUpperCase(),
  });
  if (existingDepartment) {
    throw appError.create("Department with this code already exists", 409);
  }
  validateMongodb_ID(college);
  validateMongodb_ID(headOfDepartment);
  if (courses && !Array.isArray(courses)) {
    throw appError.create(400, "Courses must be an array of course IDs");
  }
  if (courses) {
    courses.forEach((courseId) => validateMongodb_ID(courseId));
  }
  const newDepartment = await Department.create({
    name,
    description,
    code: code.toUpperCase(),
    college,
    headOfDepartment,
    courses,
  });
  // Add department to the college's departments array
  await College.findByIdAndUpdate(college, {
    $push: { departments: newDepartment._id },
  });

  res.status(201).json({
    status: "success",
    message: "Department created successfully",
    data: newDepartment,
  });
  // sendResponse(res, 201, "Department created successfully", newDepartment);
});


// GET /api/departments?college=64f7b19f5d8722341fcbbf93&sort=name&fields=name,code,createdAt&page=1&limit=5
// // Get all departments with optional filtering, sorting, and pagination
const getAllDepartments = asyncWrapper(async (req, res) => {
    let queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryStr);

    let query = Department.find(queryObj).populate('college').populate('headOfDepartment').populate('courses');

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const totalDepartments = await Department.countDocuments(queryObj);
    const totalPages = Math.ceil(totalDepartments / limit);

    const departments = await query;

    res.status(200).json({
        status: "success",
        results: departments.length,
        page,
        totalPages,
        data: departments

    });
    // sendResponse(res, 200, "Departments retrieved successfully", departments);
})

// Get all departments

// GET /api/departments?college=64f7b19f5d8722341fcbbf93&page=1&limit=5
// const getAllDepartments = asyncWrapper(async (req, res) => {
//   const { college, page = 1, limit = 10 } = req.query;

//   const filter = {};
//   if (college) {
//     filter.college = college;
//   }

//   const departments = await Department.find(filter)
//     .populate("college", "name code") // show only name & code from College
//     .populate("headOfDepartment", "firstname lastname email role")
//     .populate("courses", "code title creditHours")
//     .skip((page - 1) * limit)
//     .limit(parseInt(limit))
//     .sort({ createdAt: -1 });

//   const total = await Department.countDocuments(filter);
//   return sendResponse(res, 200, "Departments retrieved successfully", {
//     total,
//     page: parseInt(page),
//     limit: parseInt(limit),
//     data: departments,
//   });
// });

// Get a single department by ID
const getDepartmentById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const department = await Department.findById(id)
    .populate("college")
    .populate("headOfDepartment")
    .populate("courses");
  if (!department) {
    throw appError.create(404, "Department not found");
  }
  res.status(200).json({
    status: "success",
    data: department,
  });
  // sendResponse(res, 200, "Department retrieved successfully", department);
});

const getDepartments = asyncWrapper(async (req, res, next) => {
  const { collegeId } = req.params;

  const college = await College.findById(collegeId);
  if (!college) {
    throw appError.create(404, "College not found");
  }

  const departments = await Department.find({ college: collegeId });

  res.status(200).json({
    status: "success",
    results: departments.length,
    data: departments,
  });
});

// Update a department by ID
const updateDepartmentById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { name, description, code, college, headOfDepartment, courses } =
    req.body;
  validateMongodb_ID(id);
  const department = await Department.findById(id);
  if (!department) {
    throw appError.create(404, "Department not found");
  }
  if (college) {
    validateMongodb_ID(college);
    // If college is changed, update the departments array in both old and new colleges
    if (department.college.toString() !== college) {
      await College.findByIdAndUpdate(department.college, {
        $pull: { departments: department._id },
      });
      await College.findByIdAndUpdate(college, {
        $push: { departments: department._id },
      });
      department.college = college;
    }
  }
  if (headOfDepartment) {
    validateMongodb_ID(headOfDepartment);
    department.headOfDepartment = headOfDepartment;
  }
  if (courses) {
    if (!Array.isArray(courses)) {
      throw appError.create(400, "Courses must be an array of course IDs");
    }
    courses.forEach((courseId) => validateMongodb_ID(courseId));
    department.courses = courses;
  }
  if (name) department.name = name;
  if (description) department.description = description;
  if (code) {
    // Check if code already exists
    const existingDepartment = await Department.findOne({
      code: code.toUpperCase(),
    });
    if (existingDepartment && existingDepartment._id.toString() !== id) {
      throw appError.create(409, "Department with this code already exists");
    }
    department.code = code.toUpperCase();
  }
  await department.save();
  res.status(200).json({
    status: "success",
    message: "Department updated successfully",
    data: department,
  });
  // sendResponse(res, 200, "Department updated successfully", department);
});

// Delete a department by ID
const deleteDepartmentById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  validateMongodb_ID(id);
  const department = await Department.findByIdAndDelete(id)
    .populate("college")
    .populate("headOfDepartment")
    .populate("courses");
  if (!department) {
    throw appError.create(404, "Department not found");
  }
  // Remove department from the college's departments array
  await College.findByIdAndUpdate(department.college._id, {
    $pull: { departments: department._id },
  });
  res.status(200).json({
    status: "success",
    message: "Department deleted successfully",
    data: department,
  });
  // sendResponse(res, 200, "Department deleted successfully", department);
});

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartmentById,
  deleteDepartmentById,
  getDepartments
};
