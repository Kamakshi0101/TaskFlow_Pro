import { STATUS_CODES } from "../constants/index.js";

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
export const sendSuccess = (
  res,
  statusCode = STATUS_CODES.OK,
  message = "Request successful",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    ...(data && { data }),
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Additional error details
 */
export const sendError = (
  res,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
  message = "Something went wrong",
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Paginated data
 * @param {Number} total - Total records
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {String} message - Success message
 */
export const sendPaginated = (
  res,
  data,
  total,
  page,
  limit,
  message = "Data fetched successfully"
) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(STATUS_CODES.OK).json({
    success: true,
    statusCode: STATUS_CODES.OK,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};
