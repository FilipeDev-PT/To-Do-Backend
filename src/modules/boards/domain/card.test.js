import { describe, expect, it } from 'vitest'
import { createCard, moveCard, updateCard } from './card.js'
import { DomainError } from '../../../shared/errors.js'

const LIST_ID = '22222222-2222-4222-8222-222222222222'

describe('card domain', () => {
  it('creates a card with defaults', () => {
    const card = createCard({ listId: LIST_ID, title: ' Task ' })
    expect(card).toMatchObject({
      listId: LIST_ID,
      title: 'Task',
      description: '',
      position: 0,
    })
  })

  it('requires listId and valid title', () => {
    expect(() => createCard({ title: 'X' })).toThrow(DomainError)
    expect(() => createCard({ listId: LIST_ID, title: '  ' })).toThrow(DomainError)
  })

  it('updates title and description', () => {
    const card = createCard({ listId: LIST_ID, title: 'A', description: 'd' })
    const updated = updateCard(card, { title: 'B', description: 'e' })
    expect(updated).toMatchObject({ title: 'B', description: 'e' })
  })

  it('moves a card', () => {
    const card = createCard({ listId: LIST_ID, title: 'A' })
    const target = '33333333-3333-4333-8333-333333333333'
    const moved = moveCard(card, { listId: target, position: 2 })
    expect(moved).toMatchObject({ listId: target, position: 2 })
  })

  it('rejects move without listId', () => {
    const card = createCard({ listId: LIST_ID, title: 'A' })
    expect(() => moveCard(card, { position: 0 })).toThrow(DomainError)
  })
})
