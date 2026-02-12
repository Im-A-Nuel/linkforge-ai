import { FastifyInstance } from 'fastify';
import { getWalletRisk } from '../services/risk.js';

export default async function riskRoutes(fastify: FastifyInstance) {
  fastify.get('/wallet-risk', async (request, reply) => {
    const { address } = request.query as { address?: string };

    if (!address) {
      return reply.code(400).send({
        error: 'Missing required parameter: address',
      });
    }

    try {
      const data = await getWalletRisk(address);
      return data;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Failed to fetch wallet risk data',
      });
    }
  });
}
