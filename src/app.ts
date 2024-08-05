import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';

import { connectDB } from './config/database';
import { resolvers, typeDefs } from './graphql';
import { errorHandler, notFound } from './middleware';
import routes from './routes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.applyMiddleware({ app });

// Health check route
app.get('/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
