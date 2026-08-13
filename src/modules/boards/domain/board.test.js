import { describe, expect, it } from 'vitest'
import { createBoard, renameBoard } from './board.js'
import { DomainError } from '../../../shared/errors.js'

describe('board domain', () => {
  it('creates a board with trimmed title', () => {
    const board = createBoard({ title: '  Sprint  ' })
    expect(board.title).toBe('Sprint')
    expect(board.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(board.createdAt).toBeTruthy()
  })

  it('rejects empty board title', () => {
    expect(() => createBoard({ title: '   ' })).toThrow(DomainError)
    expect(() => createBoard({ title: '' })).toThrow('Board title is required')
  })

  it('renames a board', () => {
    const board = createBoard({ title: 'Old' })
    const renamed = renameBoard(board, ' New ')
    expect(renamed.title).toBe('New')
    expect(renamed.id).toBe(board.id)
  })
})
