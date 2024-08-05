// src/app.ts

import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import { connectDB } from './config/database';
import { resolvers, typeDefs } from './graphql';
import { errorHandler, notFound } from './middleware';
import routes from './routes';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Connect to MongoDB
connectDB().catch((err: Error): void => {
  // eslint-disable-next-line no-console
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }): { req: express.Request } => ({ req }),
});

void server.start().then((): void => {
  server.applyMiddleware({ app });
});

// Health check route
app.get('/health', (req, res): void => {
  res.status(200).send('OK');
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, (): void => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});

export default app;
