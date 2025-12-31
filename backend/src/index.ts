import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyApollo from '@as-integrations/fastify';
import { createApolloServer } from './server';
import { createContext } from './lib/auth';

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(cookie, {
    secret: process.env.JWT_SECRET || process.env.APP_SECRET || 'your-secret-key',
  });

  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Create Apollo Server
  const apollo = createApolloServer();
  await apollo.start();

  // Register Apollo Server
  await fastify.register(fastifyApollo(apollo), {
    context: async (request: any, reply: any) => createContext(request, reply),
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  // Start server
  const port = parseInt(process.env.PORT || '4000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server ready at http://${host}:${port}/graphql`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();

