import convict from 'convict';

// Define the ILogger interface
interface ILogger {
  log(message: string): void;
  error(message: string): void;
}
// Implement the Logger class
class Logger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string): void {
    console.error(`[${this.context}] ${message}`);
  }

  error(message: string): void {
    console.error(`[${this.context}] ${message}`);
  }
}

// Define the configuration schema
const configSchema = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  // Add other configuration properties here
};

// Create a convict configuration object
const config = convict(configSchema);

// Validate the configuration
config.validate({ allowed: 'strict' });

// Instantiate the Logger
const logger = new Logger('Configuration');

// Example usage of logger
logger.log('Configuration loaded successfully.');

export { config, logger };
