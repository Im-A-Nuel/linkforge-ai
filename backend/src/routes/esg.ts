import { FastifyInstance } from 'fastify';
import { getESGScore } from '../services/esg.js';

export default async function esgRoutes(fastify: FastifyInstance) {
  fastify.get('/esg-score', async (request, reply) => {
    const { asset } = request.query as { asset?: string };

    if (!asset) {
      return reply.code(400).send({
        error: 'Missing required parameter: asset',
      });
    }

    try {
      const data = await getESGScore(asset);
      return data;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch ESG score',
      });
    }
  });
}
