// controllers/deanship.controller.js
const Deanship = require("../models/deanship.model");
const asyncWrapper = require("../utils/asyncWrapper");
const appError = require("../utils/appError");
const validateMongodb_ID = require("../utils/validateMongodb_ID");
const { sendResponse } = require("../utils/response");
const APIFeatures = require("../utils/apiFeatures");
const buildQuery = require("../utils/queryBuilder");


// Create new deanship
const createDeanship = asyncWrapper(async (req, res) => {
    const { dean, staff, description, college, startDate, endDate } = req.body;
    if (!dean || !college || !startDate) {
        throw appError.create(400, "Missing required fields: dean, college, startDate");
    }
    validateMongodb_ID(dean);
    validateMongodb_ID(college);
    if (staff && !Array.isArray(staff)) {
        throw appError.create(400, "Staff must be an array of user IDs");
    }
    if (staff) {
        staff.forEach((userId) => validateMongodb_ID(userId));
    }
    const existingDeanship = await Deanship.findOne({ college });
    if (existingDeanship) {
        throw appError.create(409, "This college already has a deanship");
    }
    const newDeanship = await Deanship.create({
        dean,
        staff,
        description,
        college,
        startDate,
        endDate,
    });
    res.status(201).json({  
        status: "success",
        message: "Deanship created successfully",
        data: newDeanship,
    });
    // sendResponse(res, 201, "Deanship created successfully", newDeanship);
});

// // Get all deanships
// const getAllDeanships = asyncWrapper(async (req, res) => {
//     const deanships = await Deanship.find()
//         .populate("dean", "firstname lastname email role")
//         .populate("college", "name code");
//     res.status(200).json({
//         status: "success",
//         results: deanships.length,
//         data: deanships,
//     });
//     // sendResponse(res, 200, "Deanships retrieved successfully", deanships);
// });

// get all deanships with filtering, sorting, pagination
// GET /api/deanships?college=64a7f0c8e4
const getAllDeanships = asyncWrapper(async (req, res) => {
    let queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // Advanced filtering (e.g., gte, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);
    let query = Deanship.find(JSON.parse(queryStr))
        .populate("dean", "firstname lastname email role")
        .populate("college", "name code");
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
    }
    else {
        query = query.select("-__v");
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const totalDocuments = await Deanship.countDocuments(JSON.parse(queryStr));
    const totalPages = Math.ceil(totalDocuments / limit);
    if (req.query.page && skip >= totalDocuments) {
        throw appError.create(404, "This page does not exist");
    }
    const deanships = await query;
    res.status(200).json({
        status: "success",
        results: deanships.length,
        page,
        totalPages,
        data: deanships,
    });
    // sendResponse(res, 200, "Deanships retrieved successfully", { results: deanships.length, page, totalPages, deanships });
} );

// use class 
const getAllDeanshipsClass = asyncWrapper(async (req, res) => {
  const features = new APIFeatures(Deanship.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Count total for pagination
  const countQuery = new APIFeatures(Deanship.find(), req.query).filter();
  const totalDocuments = await countQuery.query.countDocuments();
  const totalPages = Math.ceil(totalDocuments / (features.limit || 10));

  if (req.query.page && features.skip >= totalDocuments) {
    throw appError.create(404, "This page does not exist");
  }

  const deanships = await features.query
    .populate("dean", "firstname lastname email role")
    .populate("college", "name code");

  res.status(200).json({
    status: "success",
    results: deanships.length,
    page: features.page,
    totalPages,
    data: deanships,
  });
});


// use function 

/*
GET /api/deanships?
  college[in]=64a7f0c8e4b0f5b6c8d9e8a1,64a7f0c8e4b0f5b6c8d9e8b2&
  startDate[gte]=2023-01-01&
  sort=startDate,-endDate&
  page=2& 
  limit=5&
  fields=dean,startDate,endDate
*/

const getAllDeanshipsFunction = asyncWrapper(async (req, res) => {
  const { query, pagination, filter } = buildQuery(Deanship, req.query);

  // Total count for pagination
  const totalDocuments = await Deanship.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / pagination.limit);

  if (req.query.page && pagination.skip >= totalDocuments) {
    throw appError.create(404, "This page does not exist");
  }

  const deanships = await query
    .populate("dean", "firstname lastname email role")
    .populate("college", "name code");

  res.status(200).json({
    status: "success",
    results: deanships.length,
    page: pagination.page,
    totalPages,
    data: deanships,
  });
});

// Get single deanship
const getDeanshipById = asyncWrapper(async (req, res, next) => { 
    validateMongodb_ID(req.params.id);
    const deanship = await Deanship.findById(req.params.id)
        .populate("dean", "firstname lastname email role")
        .populate("college", "name code");
    if (!deanship) return next(appError.create(404, "Deanship not found"));
    res.status(200).json({
        status: "success",
        data: deanship,
    });
    // sendResponse(res, 200, "Deanship retrieved successfully", deanship);
} );

// PUT /api/deanships/:id
// Update a deanship by ID
const updateDeanshipById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    validateMongodb_ID(id);
    const { dean, staff, description, college, startDate, endDate } = req.body;

    const updateData = {};
    if (dean) {
        validateMongodb_ID(dean);
        updateData.dean = dean;
    }
    if (staff) {
        if (!Array.isArray(staff)) {
            throw appError.create(400, "Staff must be an array of user IDs");
        }
        staff.forEach((userId) => validateMongodb_ID(userId));
        updateData.staff = staff;
    }
    if (description) updateData.description = description;
    if (college) {
        validateMongodb_ID(college);
        // Check if college already has a deanship
        const existingDeanship = await Deanship.findOne({ college, _id: { $ne: id } });
        if (existingDeanship) {
            throw appError.create(409, "This college already has a deanship");
        }
        updateData.college = college;
    }
    if (startDate) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    const updatedDeanship = await Deanship.findByIdAndUpdate(id, updateData, { new: true })
        .populate("dean", "firstname lastname email role")
        .populate("college", "name code");

    if (!updatedDeanship) {
        return next(appError.create(404, "Deanship not found"));
    }

    res.status(200).json({
        status: "success",
        message: "Deanship updated successfully",
        data: updatedDeanship,
    });
    // sendResponse(res, 200, "Deanship updated successfully", updatedDeanship);
} );

// DELETE /api/deanships/:id
// Delete a deanship by ID
const deleteDeanshipById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    validateMongodb_ID(id);
    const deletedDeanship = await Deanship.findByIdAndDelete(id);
    if (!deletedDeanship) {
        return next(appError.create(404, "Deanship not found"));
    }
    res.status(200).json({
        status: "success",
        message: "Deanship deleted successfully",
    });
    // sendResponse(res, 200, "Deanship deleted successfully");
} );

module.exports = {
    createDeanship,
    getAllDeanships,
    getDeanshipById,
    updateDeanshipById,
    deleteDeanshipById, 
};  


// // Create new deanship
// exports.createDeanship = asyncWrapper(async (req, res) => {
//   const deanship = await Deanship.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: deanship,
//   });
// });

// // Get all deanships
// exports.getAllDeanships = asyncWrapper(async (req, res) => {
//   const deanships = await Deanship.find()
//     .populate("dean", "firstName lastName email role")
//     .populate("college", "name code");

//   res.status(200).json({
//     status: "success",
//     results: deanships.length,
//     data: deanships,
//   });
// });

// // Get single deanship
// exports.getDeanshipById = asyncWrapper(async (req, res, next) => {
//   const deanship = await Deanship.findById(req.params.id)
//     .populate("dean", "firstName lastName email role")
//     .populate("college", "name code");

//   if (!deanship) return next(appError.create(404, "Deanship not found"));

//   res.status(200).json({
//     status: "success",
//     data: deanship,
//   });
// });
