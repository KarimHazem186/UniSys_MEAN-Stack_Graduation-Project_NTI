const Course = require("../models/course.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const { sendResponse } = require("../utils/response");
const validateMongodb_ID = require("../utils/validateMongodb_ID");
const Program = require("../models/program.model");


// Create a new course and optionally assign it to programs
const createCourse = asyncWrapper(async (req, res) => {
    const { code, title, description, creditHours, department, prerequisites, programs } =
        req.body;
    if (!code || !title || !creditHours || !department) {
        throw appError.create(400, "Missing required fields");
    }
    // Check if code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
        throw appError.create(409, "Course with this code already exists");
    }
    validateMongodb_ID(department);
    if (prerequisites && !Array.isArray(prerequisites)) {
        throw appError.create(400, "Prerequisites must be an array of course IDs");
    }
    if (prerequisites) {
        prerequisites.forEach((courseId) => validateMongodb_ID(courseId));
    }
    if (programs && !Array.isArray(programs)) {
        throw appError.create(400, "Programs must be an array of program IDs");
    }
    if (programs) {
        programs.forEach((programId) => validateMongodb_ID(programId));
    }
    const newCourse = await Course.create({
        code: code.toUpperCase(),
        title,
        description,
        creditHours,
        department,
        prerequisites,
        programs,
    });
    // If programs are provided, add this course to the programs' courses array
    if (programs) {
        await Program.updateMany(
        { _id: { $in: programs } },
        { $addToSet: { courses: newCourse._id } }
        );
    }
    res.status(201).json({
        status: "success",
        message: "Course created successfully",
        data: newCourse,
    });
     // sendResponse(res, 201, "Course created successfully", newCourse);
    } )

// GET /api/courses?department=64f7b2a15d8722341fcbbf95&sort=code&fields=code,title,createdAt&page=1&limit=5
// Get all courses with optional filtering, sorting, and pagination
const getAllCourses = asyncWrapper(async (req, res) => {
    let queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
    let query = Course.find(JSON.parse(queryStr)).populate('department').populate('programs').populate('prerequisites');

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

    const totalDocuments = await Course.countDocuments(JSON.parse(queryStr));
    const totalPages = Math.ceil(totalDocuments / limit);

    if (req.query.page && skip >= totalDocuments) {
        throw appError.create(404, "This page does not exist");
    }

    const courses = await query;

    res.status(200).json({
        status: "success",
        results: courses.length,
        page,
        totalPages,
        data: courses,
    });
     // sendResponse(res, 200, "Courses retrieved successfully", { results: courses.length, page, totalPages, courses });
} )
// Get a single course by ID
const getCourseById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    validateMongodb_ID(id);
    const course = await Course.findById(id).populate('department').populate('programs').populate('prerequisites');
    if (!course) {
        throw appError.create(404, "Course not found");
    }
    res.status(200).json({
        status: "success",
        data: course,
    });
     // sendResponse(res, 200, "Course retrieved successfully", course);
} )

// PATCH /api/courses/:id
// Update a course by ID

const updateCourseById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    validateMongodb_ID(id);
    const { code, title, description, creditHours, department, prerequisites, programs, isActive } = req.body;

    const updateData = {};
    if (code) {
        updateData.code = code.toUpperCase();
        // Check if code already exists
        const existingCourse = await Course.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
        if (existingCourse) {
            throw appError.create(409, "Course with this code already exists");
        }
    }
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (creditHours) updateData.creditHours = creditHours;
    if (department) {
        validateMongodb_ID(department);
        updateData.department = department;
    }
    if (prerequisites) {
        if (!Array.isArray(prerequisites)) {
            throw appError.create(400, "Prerequisites must be an array of course IDs");
        }
        prerequisites.forEach((courseId) => validateMongodb_ID(courseId));
        updateData.prerequisites = prerequisites;
    }
    if (programs) {
        if (!Array.isArray(programs)) {
            throw appError.create(400, "Programs must be an array of program IDs");
        }
        programs.forEach((programId) => validateMongodb_ID(programId));
        updateData.programs = programs;
    }
    if (typeof isActive === 'boolean') {
        updateData.isActive = isActive;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCourse) {
        throw appError.create(404, "Course not found");
    }

    // If programs are provided, update the courses array in the Program model
    if (programs) {
        // Remove this course from all programs not in the new list
        await Program.updateMany(
            { courses: updatedCourse._id, _id: { $nin: programs } },
            { $pull: { courses: updatedCourse._id } }
        );
        // Add this course to the new programs
        await Program.updateMany(
            { _id: { $in: programs } },
            { $addToSet: { courses: updatedCourse._id } }       
        );
    }       
    res.status(200).json({
        status: "success",
        message: "Course updated successfully",
        data: updatedCourse,
    });
     // sendResponse(res, 200, "Course updated successfully", updatedCourse);   
} ) 

// DELETE /api/courses/:id
// Delete a course by ID
const deleteCourseById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    validateMongodb_ID(id);
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
        throw appError.create(404, "Course not found");
    }
    // Remove this course from all programs' courses array
    await Program.updateMany(
        { courses: course._id },
        { $pull: { courses: course._id } }
    );
    res.status(200).json({
        status: "success",
        message: "Course deleted successfully",
    });
     // sendResponse(res, 200, "Course deleted successfully");
} )

// Get all courses for a specific department
const getCoursesByPrograms = asyncWrapper(async (req, res) => {
    const { programId } = req.params;
    validateMongodb_ID(programId);
    const courses = await Course.find({ programs: programId }).populate('department').populate('programs').populate('prerequisites');
    res.status(200).json({
        status: "success",
        results: courses.length,
        data: courses,
    });
     // sendResponse(res, 200, "Courses retrieved successfully", { results: courses.length, courses });
})    

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
  getCoursesByPrograms
};