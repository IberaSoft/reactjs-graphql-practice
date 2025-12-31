import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Query } from './resolvers/Query';
import { Mutation } from './resolvers/Mutation';
import { GraphQLContext } from './lib/auth';

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

const resolvers = {
  Query,
  Mutation,
};

export function createApolloServer() {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin()],
    introspection: process.env.NODE_ENV !== 'production',
  });
}

