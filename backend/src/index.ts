import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import sentimentRoutes from './routes/sentiment.js';
import riskRoutes from './routes/risk.js';
import esgRoutes from './routes/esg.js';
import creRoutes from './routes/cre.js';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// CORS configuration
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(sentimentRoutes, { prefix: '/api' });
fastify.register(riskRoutes, { prefix: '/api' });
fastify.register(esgRoutes, { prefix: '/api' });
fastify.register(creRoutes, { prefix: '/api' });

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
