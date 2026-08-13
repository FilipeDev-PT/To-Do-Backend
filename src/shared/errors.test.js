import { describe, expect, it } from 'vitest'
import {
  AppError,
  DomainError,
  NotFoundError,
  ValidationError,
} from './errors.js'

describe('errors', () => {
  it('maps AppError subclasses', () => {
    expect(new NotFoundError('missing')).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      name: 'NotFoundError',
    })
    expect(new ValidationError('bad', [{ path: 'title' }])).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: [{ path: 'title' }],
    })
    expect(new DomainError('rule')).toMatchObject({
      statusCode: 422,
      code: 'DOMAIN_ERROR',
    })
    expect(new AppError('x')).toMatchObject({ statusCode: 500, code: 'APP_ERROR' })
  })
})
