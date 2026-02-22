import { FastifyInstance } from 'fastify';
import { getCRERecommendation } from '../services/cre.js';

export default async function creRoutes(fastify: FastifyInstance) {
  fastify.get('/cre-recommendation', async (_request, reply) => {
    try {
      const data = await getCRERecommendation();
      return data;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to compute CRE recommendation' });
    }
  });
}
