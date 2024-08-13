import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import { serverConfig } from './config/ServerConfig';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import logger from './utils/logging';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apollo Server setup
const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
  server.applyMiddleware({ app, path: '/graphql' });

  // Start the server
  app.listen(serverConfig.port, () => {
    logger.info(
      `🚀 Server ready at http://localhost:${serverConfig.port}${server.graphqlPath}`,
    );
  });
});
