export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'APP_ERROR' } = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' })
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR' })
    this.name = 'ValidationError'
    this.details = details
  }
}

export class DomainError extends AppError {
  constructor(message) {
    super(message, { statusCode: 422, code: 'DOMAIN_ERROR' })
    this.name = 'DomainError'
  }
}
