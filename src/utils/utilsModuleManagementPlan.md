# Utility Module Management Plan

## Objective

Provide a comprehensive set of reusable utility functions for the HarmonyHub backend, promoting code maintainability, readability, and consistency. This module will be tightly integrated with the configuration management system, allowing for flexible and configurable behavior across different aspects of the application.

## Components

1. **audio/**

   - **Objective:** Handle audio-specific operations, deeply integrated with `AudioProcessingConfig`.

   - **Sub-Modules:**

     - **`formats.ts`:**
       - `getSupportedAudioFormats()`: Returns supported audio formats from `audioProcessingConfig`.
       - `isAudioFormatSupported(extension: string)`: Checks if an extension is supported using `audioProcessingConfig`.
       - `getAudioFormatInfo(extension: string)`: Retrieves format details (MIME type, codec) from `audioProcessingConfig`.
     - **`analysis.ts`:**
       - `calculateRMS(audioBuffer: Float32Array)`: Calculates the Root Mean Square (RMS) of an audio buffer.
       - `generateWaveform(audioBuffer: Float32Array, width: number): number[]`: Generates a simplified waveform for visualization.
       - `extractAudioMetadata(filePath: string): Promise<AudioMetadata>`: Extracts audio metadata (using external libraries if necessary).
     - **`effects.ts`:**
       - `applyReverb(audioBuffer: Float32Array, settings: ReverbSettings): Promise<Float32Array>`: Applies reverb using validated `ReverbSettings`.
       - `applyEqualization(audioBuffer: Float32Array, bands: EQBand[]): Promise<Float32Array>`: Applies EQ using validated `EQBand` settings.
     - **`validation.ts`:**
       - `validateAudioFile(filePath: string): Promise<boolean>`: Validates audio file format and integrity.

2. **caching.ts**

   - **Objective:** Provide caching mechanisms aligned with `CacheConfig`.

   - **Functions:**
     - `getCachedValue<T>(key: string): Promise<T | undefined>`: Retrieves cached values using `cacheConfig`.
     - `setCachedValue<T>(key: string, value: T, ttl?: number): Promise<void>`: Caches values using `cacheConfig` for TTL or an optional parameter.
     - `retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T>`: Retries a function with exponential backoff on failure.
     - **Implement:** Distributed locking using `cacheConfig.distributedLock` to prevent cache stampede.

3. **crypto.ts**

   - **Objective:** Handle cryptographic operations securely, integrated with `SecurityConfig`.

   - **Functions:**
     - `encrypt(data: string): Promise<string>`: Encrypts data using `SecurityConfig`.
     - `decrypt(data: string): Promise<string>`: Decrypts data using `SecurityConfig`.
     - **Consider:** Adding functions for JWT signing/verification using `authConfig.jwt`.

4. **date.ts**

   - **Objective:** Manage date/time operations using Luxon, integrated with relevant config settings.

   - **Functions:**
     - `formatDateTime(date: DateTime, formatString: string): string`: Formats dates using Luxon.
     - `getUTCOffset(timezone: string): string`: Gets the UTC offset for a given timezone.
     - `calculateDuration(start: DateTime, end: DateTime): Duration`: Calculates the duration between two DateTime objects.
     - **Add:** Functions to parse JWT expiration times from `authConfig.jwt.expiresIn`.
     - **Add:** Functions to work with time durations (using Luxon's `Duration`) for caching (`CacheConfig`) and other time-sensitive operations.

5. **errorUtils.ts**

   - **Objective:** Define custom error classes for better error handling and reporting.

   - **Classes:**
     - `CustomError`: A base class for custom errors, extending the built-in `Error` class.
     - **Add:** Specific error classes for different error scenarios in the application.

6. **file.ts**

   - **Objective:** Handle file system operations, integrated with `StorageConfig`.

   - **Functions:**
     - `readFile(filePath: string): Promise<string>`: Reads a file from the file system.
     - `writeFile(filePath: string, data: string): Promise<void>`: Writes data to a file in the file system.
     - `deleteFile(filePath: string): Promise<void>`: Deletes a file from the file system.

7. **i18n.ts**

   - **Objective:** Handle internationalization and localization using `i18next` and `LocalizationConfig`.

   - **Functions:**
     - `translate(key: string, options?: i18next.TOptions): string`: Translates keys to the current language.
     - `setLocale(locale: string): void`: Sets the current locale.
     - **Add:** Functions to load translations based on `localizationConfig.translationFilePath`.
     - **Add:** Functions to format numbers and currencies based on `localizationConfig.numberFormat`.

8. **logging.ts**

   - **Objective:** Enhance logging functionality, integrating with `LoggingConfig` and a logging framework (e.g., Winston, Pino).

   - **Functions:**
     - `logInfo(message: string): void`: Logs an informational message.
     - `logError(message: string): void`: Logs an error message.
     - `logDebug(message: string): void`: Logs a debug message.

9. **math.ts**

   - **Objective:** Provide mathematical functions for audio processing and analysis.

   - **Functions:**
     - `calculateAverage(numbers: number[]): number`: Calculates the average of an array of numbers.
     - `convertDecibelToLinear(dB: number): number`: Converts decibels (dB) to a linear scale.
     - **Add:** Project-specific functions for audio effects or analysis based on the project's DSP needs.

10. **network.ts**

    - **Objective:** Manage network-related tasks.

    - **Functions:**
      - `fetchData(url: string): Promise<any>`: Fetches data from a given URL.
      - `postData(url: string, data: any): Promise<any>`: Posts data to a given URL.
      - **Add:** Functions to handle network retries and timeouts based on `NetworkConfig`.

11. **performance.ts**

    - **Objective:** Measure and analyze performance, potentially using `PerformanceConfig`.

    - **Functions:**
      - `measureExecutionTime<T>(fn: () => T): Promise<[T, number]>`: Measures function execution time.
      - **Add:** Functions to monitor resource usage (CPU, memory) based on `performanceConfig`.

## Consistencies Across Utility Files

1. **Imports:**

   - Import necessary modules and types: `import { z } from 'zod';`
   - Import the `config` object from the config module instead of individual config files.
   - Use the `logger` from the logging utility instead of `console.log`.

2. **Function Definitions:**

   - Use camelCase for function names: `export function utilityFunction() {...}`
   - Provide type annotations for parameters and return types.
   - Use arrow functions for consistency: `export const utilityFunction = () => {...}`

3. **Type Definitions:**

   - Define types for complex data structures: `type ComplexType = {...};`
   - Use Zod for runtime type checking where applicable.

4. **Error Handling:**

   - Use try-catch blocks for error-prone operations.
   - Throw custom errors with descriptive messages.
   - Log errors before throwing them.
   - Use the `CustomError` class for all error scenarios.
   - Ensure errors are logged using the `logger` utility before being thrown.

5. **Validation:**

   - Use Zod schemas for validating input/output where appropriate.
   - Implement input validation at the beginning of functions.
   - Utilize Zod for schema validation and runtime type checking to ensure data integrity and reduce runtime errors.

6. **Configuration Integration:**

   - Use imported configuration objects for dynamic behavior.
   - Avoid hardcoding values that should be configurable.
   - Utilize configuration values from the `config/` module to control the behavior of utility functions.
   - Implement functions to access and parse configuration options relevant to each utility module.

7. **Comments and Documentation:**

   - Use JSDoc style comments for functions and types.
   - Provide detailed descriptions for parameters and return values.

8. **Performance Considerations:**

   - Implement memoization for expensive operations.
   - Use efficient data structures and algorithms.
   - Optimize performance-critical utility functions for efficiency.
   - Utilize caching mechanisms where applicable, leveraging `CacheConfig`.
   - Consider asynchronous operations and efficient data structures.
   - Profile and benchmark performance-critical utility functions.
   - Utilize caching mechanisms strategically.
   - Consider asynchronous operations for non-blocking behavior.

9. **Testing Considerations:**

   - Design functions to be easily testable.
   - Avoid side effects where possible.

10. **File Structure:**

    - Start with a file-level comment describing the purpose of the utility file.
    - Order: imports, type definitions, function definitions.

11. **Naming Conventions:**

    - Use descriptive names for functions and variables.
    - Group related utilities in appropriately named files.

12. **Extensibility:**
    - Design utilities to be easily extensible for future additions.

### Functionality

1. **Configuration Integration:**

   - Utilize configuration values from the `config/` module to control the behavior of utility functions.
   - Implement functions to access and parse configuration options relevant to each utility module.

2. **Error Handling:**

   - Use the `CustomError` class for all error scenarios.
   - Ensure errors are logged using the `logger` utility before being thrown.

3. **Validation:**

   - Utilize Zod for schema validation and runtime type checking to ensure data integrity and reduce runtime errors.

4. **Performance:**
   - Optimize performance-critical utility functions for efficiency.
   - Utilize caching mechanisms where applicable, leveraging `CacheConfig`.
   - Consider asynchronous operations and efficient data structures.

### Technologies

- **TypeScript:** For type safety, code organization, and improved developer experience.
- **Zod:** For schema validation and runtime type checking.
- **Luxon:** For date and time operations.
- **i18next:** For internationalization and localization.
- **Winston/Pino:** For logging.
- **External Libraries:** Leverage well-established libraries for specific tasks (e.g., DOMPurify for HTML sanitization).

### Integration Points

- Integrate with all other modules of the HarmonyHub backend to provide reusable utility functions.
- Utilize the `config/` module extensively for configuration-driven behavior.
- Integrate with logging, security, and performance monitoring modules.

### Performance Considerations

- Profile and benchmark performance-critical utility functions.
- Utilize caching mechanisms strategically.
- Consider asynchronous operations for non-blocking behavior.
- Choose efficient data structures and algorithms.

## Utility Template

```typescript
// src/utils/sampleUtil.ts

import { z } from 'zod';
import { config } from '../config';
import { CustomError } from './errorUtils';
import { logger } from './logging';

/**
 * Schema for complex input type
 */
const ComplexInputSchema = z.object({
  field1: z.string().describe('Description of field1'),
  field2: z.number().positive().describe('Description of field2'),
});

/**
 * Type definition for complex input
 */
type ComplexInput = z.infer<typeof ComplexInputSchema>;

/**
 * Processes a complex input and returns a result
 * @param {ComplexInput} input - The complex input to process
 * @returns {string} The processed result
 * @throws {CustomError} If input is invalid or processing fails
 */
export const processComplexInput = (input: ComplexInput): string => {
  try {
    // Validate input
    ComplexInputSchema.parse(input);

    // Process the input using configuration
    const result = `Processed ${input.field1} with config value ${config.aiServices.someValue}`;

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Input validation failed:', error.errors);
      throw new CustomError('Invalid input', 'INVALID_INPUT', 400);
    }
    logger.error('Processing failed:', error);
    throw new CustomError('Processing failed', 'PROCESSING_ERROR', 500);
  }
};

/**
 * Memoized utility function for expensive operations
 */
export const memoizedExpensiveOperation = (() => {
  const cache = new Map<string, number>();

  return (input: string): number => {
    if (cache.has(input)) {
      return cache.get(input)!;
    }

    // Simulate expensive operation
    const result = input.length * config.performance.complexFactor;
    cache.set(input, result);

    return result;
  };
})();

// Validate the utility functions
try {
  const sampleInput: ComplexInput = { field1: 'test', field2: 5 };
  processComplexInput(sampleInput);
  memoizedExpensiveOperation('test');
} catch (error) {
  logger.error('Utility function validation failed:', error);
  throw error;
}
```

This template ensures consistency across utility files and aligns with the config module and overall project structure. When creating new utility files or modifying existing ones, developers should follow this template and adapt it to the specific needs of each utility while maintaining the established conventions.

This template and the list of consistencies should be applied across all utility files to ensure uniformity, maintainability, and consistency with your config module in your project.
