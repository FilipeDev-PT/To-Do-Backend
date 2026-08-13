import { fastify } from 'fastify'
import cors from '@fastify/cors'
import { errorHandler } from './shared/http/error-handler.js'
import { requestIdPlugin } from './shared/http/request-id.js'
import { boardsRoutes } from './modules/boards/infrastructure/http/boards.routes.js'

export async function buildApp({ boardsController, logger = true }) {
  const app = fastify({ logger })

  app.setErrorHandler(errorHandler)
  await app.register(cors, { origin: true })
  // Chamada direta: hooks precisam valer para todas as rotas (sem encapsulamento).
  await requestIdPlugin(app)
  await app.register(boardsRoutes, { controller: boardsController })

  app.get('/healthz', async () => ({ status: 'ok' }))

  return app
}
