import { config } from './shared/config.js'
import { buildContainer } from './composition-root.js'
import { buildApp } from './app.js'

const container = buildContainer()
const app = await buildApp({ boardsController: container.boardsController })

try {
  await app.listen({ host: '0.0.0.0', port: config.port })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

async function shutdown(signal) {
  app.log.info(`Received ${signal}, shutting down...`)
  try {
    await app.close()
    process.exit(0)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
