const sendResponse = (res, statusCode, message, data = null, accessToken = null) => {
  const response = { message };

  if (accessToken) response.accessToken = accessToken;
  if (data) response.data = data;

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = { message };
  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

module.exports = { sendResponse, sendError };
