import { randomUUID } from 'node:crypto'

export async function requestIdPlugin(fastify) {
  fastify.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers['x-request-id']
    const requestId = typeof incoming === 'string' && incoming.length > 0
      ? incoming
      : randomUUID()
    request.requestId = requestId
    reply.header('x-request-id', requestId)
  })
}
