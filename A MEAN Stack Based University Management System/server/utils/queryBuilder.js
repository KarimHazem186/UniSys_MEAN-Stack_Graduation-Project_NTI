function buildQuery(model, queryParams = {}) {
  const queryObj = { ...queryParams };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((field) => delete queryObj[field]);

  
  // Advanced filtering operators
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|ne|regex)\b/g,
    (match) => `$${match}`
  );

  let query = model.find(JSON.parse(queryStr));

  // Sorting
  if (queryParams.sort) {
    const sortBy = queryParams.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Field limiting
  if (queryParams.fields) {
    const fields = queryParams.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // Pagination
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  return {
    query,
    pagination: { page, limit, skip },
    filter: JSON.parse(queryStr),
  };
}

module.exports = buildQuery;
