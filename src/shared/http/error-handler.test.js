import { describe, expect, it, vi } from 'vitest'
import { DomainError, NotFoundError, ValidationError } from '../errors.js'
import { errorHandler } from './error-handler.js'

function createReply() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    send(payload) {
      this.body = payload
      return this
    },
  }
}

describe('errorHandler', () => {
  it('maps Fastify validation errors', () => {
    const reply = createReply()
    errorHandler({ validation: [], message: 'querystring invalid' }, { log: { error: vi.fn() } }, reply)
    expect(reply.statusCode).toBe(400)
    expect(reply.body.code).toBe('VALIDATION_ERROR')
  })

  it('maps AppError subclasses', () => {
    const reply = createReply()
    errorHandler(new NotFoundError('Board not found'), { log: { error: vi.fn() } }, reply)
    expect(reply).toMatchObject({
      statusCode: 404,
      body: { code: 'NOT_FOUND', message: 'Board not found' },
    })

    const validationReply = createReply()
    errorHandler(new ValidationError('bad', [{ code: 'x' }]), { log: { error: vi.fn() } }, validationReply)
    expect(validationReply.body.details).toEqual([{ code: 'x' }])

    const domainReply = createReply()
    errorHandler(new DomainError('nope'), { log: { error: vi.fn() } }, domainReply)
    expect(domainReply.statusCode).toBe(422)
  })

  it('maps unexpected errors to 500', () => {
    const reply = createReply()
    const log = { error: vi.fn() }
    errorHandler(new Error('boom'), { log, requestId: 'req-1' }, reply)
    expect(reply.statusCode).toBe(500)
    expect(reply.body.code).toBe('INTERNAL_ERROR')
    expect(log.error).toHaveBeenCalled()
  })
})
