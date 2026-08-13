import { describe, expect, it } from 'vitest'
import {
  boardIdParams,
  createBoardBody,
  moveCardBody,
  parseOrThrow,
  updateCardBody,
  updateListBody,
} from './boards.schemas.js'
import { ValidationError } from '../../../../shared/errors.js'

describe('boards.schemas', () => {
  it('accepts valid board id and body', () => {
    expect(parseOrThrow(boardIdParams, { boardId: '11111111-1111-4111-8111-111111111111' }))
      .toEqual({ boardId: '11111111-1111-4111-8111-111111111111' })
    expect(parseOrThrow(createBoardBody, { title: 'Board' })).toEqual({ title: 'Board' })
  })

  it('rejects invalid uuid', () => {
    expect(() => parseOrThrow(boardIdParams, { boardId: 'nope' })).toThrow(ValidationError)
  })

  it('requires at least one field on update list/card', () => {
    expect(() => parseOrThrow(updateListBody, {})).toThrow(ValidationError)
    expect(() => parseOrThrow(updateCardBody, {})).toThrow(ValidationError)
    expect(parseOrThrow(updateCardBody, { description: 'x' })).toEqual({ description: 'x' })
  })

  it('validates moveCard body', () => {
    const listId = '22222222-2222-4222-8222-222222222222'
    expect(parseOrThrow(moveCardBody, { listId, position: 0 })).toEqual({ listId, position: 0 })
    expect(() => parseOrThrow(moveCardBody, { listId, position: -1 })).toThrow(ValidationError)
  })
})
