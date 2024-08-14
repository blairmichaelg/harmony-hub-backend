// src/utils/math.ts

import { z } from 'zod';

import { CustomError } from './errorUtils';
import logger from './logging';

/**
 * Schema for array of numbers input
 */
const NumbersArraySchema = z
  .array(z.number())
  .nonempty()
  .describe('Array of numbers');

/**
 * Calculates the average of an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The average value
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) {
    return 0;
  }

  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
};

/**
 * Converts decibels (dB) to a linear scale
 * @param {number} dB - The decibel value
 * @returns {number} The linear value
 */
export const convertDecibelToLinear = (dB: number): number => {
  return Math.pow(10, dB / 20);
};

/**
 * Calculates the RMS (Root Mean Square) of an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The RMS value
 * @throws {CustomError} If input is invalid
 */
export const calculateRMS = (numbers: number[]): number => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    const sumOfSquares = numbers.reduce((sum, num) => sum + num * num, 0);
    return Math.sqrt(sumOfSquares / numbers.length);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Calculation failed:', error);
    throw new CustomError('Calculation failed', 'CALCULATION_ERROR', 500);
  }
};

/**
 * Finds the peak value in an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The peak value
 * @throws {CustomError} If input is invalid
 */
export const findPeak = (numbers: number[]): number => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    return Math.max(...numbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Calculation failed:', error);
    throw new CustomError('Calculation failed', 'CALCULATION_ERROR', 500);
  }
};

/**
 * Normalizes an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number[]} The normalized array
 * @throws {CustomError} If input is invalid
 */
export const normalizeArray = (numbers: number[]): number[] => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    const max = Math.max(...numbers);
    if (max === 0) {
      return numbers;
    }

    return numbers.map((num) => num / max);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Normalization failed:', error);
    throw new CustomError('Normalization failed', 'NORMALIZATION_ERROR', 500);
  }
};

/**
 * Calculates the variance of an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The variance
 * @throws {CustomError} If input is invalid
 */
export const calculateVariance = (numbers: number[]): number => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    const mean = calculateAverage(numbers);
    const variance =
      numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) /
      numbers.length;

    return variance;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Calculation failed:', error);
    throw new CustomError('Calculation failed', 'CALCULATION_ERROR', 500);
  }
};

/**
 * Finds the minimum value in an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The minimum value
 * @throws {CustomError} If input is invalid
 */
export const calculateMin = (numbers: number[]): number => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    return Math.min(...numbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Calculation failed:', error);
    throw new CustomError('Calculation failed', 'CALCULATION_ERROR', 500);
  }
};

/**
 * Finds the maximum value in an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} The maximum value
 * @throws {CustomError} If input is invalid
 */
export const calculateMax = (numbers: number[]): number => {
  try {
    // Validate input
    NumbersArraySchema.parse(numbers);

    return Math.max(...numbers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Calculation failed:', error);
    throw new CustomError('Calculation failed', 'CALCULATION_ERROR', 500);
  }
};
