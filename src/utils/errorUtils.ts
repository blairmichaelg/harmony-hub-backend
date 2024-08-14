// src/utils/errorUtils.ts

import logger from './logging';

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
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'CustomError';
    Object.setPrototypeOf(this, CustomError.prototype);
    logger.error(`CustomError: ${message}`, { code, statusCode });
  }
}

/**
 * Specific error class for validation errors
 */
export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Specific error class for authentication errors
 */
export class AuthenticationError extends CustomError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Specific error class for authorization errors
 */
export class AuthorizationError extends CustomError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Specific error class for not found errors
 */
export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Specific error class for internal server errors
 */
export class InternalServerError extends CustomError {
  constructor(message: string) {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
    this.name = 'InternalServerError';
  }
}

/**
 * Creates a standardized error response object
 * @param {CustomError} error - The CustomError object
 * @returns {{ error: { message: string; code: string; statusCode: number } }} The standardized error response
 */
export const createErrorResponse = (
  error: CustomError,
): { error: { message: string; code: string; statusCode: number } } => {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  };
};
