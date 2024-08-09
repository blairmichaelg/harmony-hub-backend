// src/utils/errorUtils.ts

/**
 * Custom error class for the application
 */
export class CustomError extends Error {
  /**
   * Creates a new CustomError instance
   * @param {string} message - The error message
   * @param {string} code - The error code
   * @param {number} statusCode - The HTTP status code
   */
  constructor(public message: string, public code: string, public statusCode: number) {
    super(message);
    this.name = 'CustomError';
  }
}

/**
 * Creates a standardized error response object
 * @param {CustomError} error - The CustomError object
 * @returns {{ error: { message: string; code: string; statusCode: number } }} The standardized error response
 */
export const createErrorResponse = (
  error: CustomError
): {
  error: { message: string; code: string; statusCode: number };
} => {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  };
};
