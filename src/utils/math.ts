// src/utils/math.ts

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
