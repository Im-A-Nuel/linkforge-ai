import { FastifyInstance } from 'fastify';
import { getSentimentData } from '../services/sentiment.js';

export default async function sentimentRoutes(fastify: FastifyInstance) {
  fastify.get('/sentiment', async (request, reply) => {
    const { asset } = request.query as { asset?: string };

    if (!asset) {
      return reply.code(400).send({
        error: 'Missing required parameter: asset',
      });
    }

    try {
      const data = await getSentimentData(asset);
      return data;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch sentiment data',
      });
    }
  });
}
