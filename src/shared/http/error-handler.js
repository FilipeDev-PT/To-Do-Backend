import { AppError } from '../errors.js'

export function errorHandler(error, request, reply) {
  if (error.validation) {
    return reply.status(400).send({
      error: 'ValidationError',
      code: 'VALIDATION_ERROR',
      message: error.message,
    })
  }

  if (error instanceof AppError) {
    const body = {
      error: error.name,
      code: error.code,
      message: error.message,
    }
    if (error.details) {
      body.details = error.details
    }
    return reply.status(error.statusCode).send(body)
  }

  request.log.error({ err: error, requestId: request.requestId }, 'Unhandled error')
  return reply.status(500).send({
    error: 'InternalServerError',
    code: 'INTERNAL_ERROR',
    message: 'Unexpected error',
  })
}
