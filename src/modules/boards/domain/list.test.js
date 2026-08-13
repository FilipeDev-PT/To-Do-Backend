import { describe, expect, it } from 'vitest'
import { createList, updateList } from './list.js'
import { DomainError } from '../../../shared/errors.js'

const BOARD_ID = '11111111-1111-4111-8111-111111111111'

describe('list domain', () => {
  it('creates a list with defaults', () => {
    const list = createList({ boardId: BOARD_ID, title: ' Todo ' })
    expect(list).toMatchObject({
      boardId: BOARD_ID,
      title: 'Todo',
      position: 0,
    })
  })

  it('requires boardId', () => {
    expect(() => createList({ title: 'X' })).toThrow(DomainError)
  })

  it('rejects invalid position', () => {
    expect(() => createList({ boardId: BOARD_ID, title: 'X', position: -1 })).toThrow(
      DomainError,
    )
  })

  it('updates title and position', () => {
    const list = createList({ boardId: BOARD_ID, title: 'A', position: 0 })
    const updated = updateList(list, { title: 'B', position: 2 })
    expect(updated).toMatchObject({ title: 'B', position: 2 })
  })
})
