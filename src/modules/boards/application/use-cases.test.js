import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DomainError, NotFoundError } from '../../../shared/errors.js'
import { makeCreateBoard } from './create-board.js'
import { makeListBoards } from './list-boards.js'
import { makeGetBoard } from './get-board.js'
import { makeUpdateBoard } from './update-board.js'
import { makeDeleteBoard } from './delete-board.js'
import { makeCreateList } from './create-list.js'
import { makeUpdateList } from './update-list.js'
import { makeDeleteList } from './delete-list.js'
import { makeCreateCard } from './create-card.js'
import { makeUpdateCard } from './update-card.js'
import { makeDeleteCard } from './delete-card.js'
import { CARD_MOVED, makeMoveCard } from './move-card.js'
import { createEventBus } from '../../../test/create-event-bus.js'
import { createInMemoryBoardRepository } from '../../../test/in-memory-board.repository.js'

describe('boards use cases', () => {
  /** @type {ReturnType<typeof createInMemoryBoardRepository>} */
  let repository
  /** @type {ReturnType<typeof createEventBus>} */
  let eventBus

  beforeEach(() => {
    repository = createInMemoryBoardRepository()
    eventBus = createEventBus()
  })

  it('creates and lists boards', async () => {
    const createBoard = makeCreateBoard({ repository })
    const listBoards = makeListBoards({ repository })

    const board = await createBoard({ title: 'Board A' })
    const boards = await listBoards()

    expect(board.title).toBe('Board A')
    expect(boards).toHaveLength(1)
    expect(boards[0].id).toBe(board.id)
  })

  it('gets, updates and deletes a board', async () => {
    const createBoard = makeCreateBoard({ repository })
    const getBoard = makeGetBoard({ repository })
    const updateBoard = makeUpdateBoard({ repository })
    const deleteBoard = makeDeleteBoard({ repository })

    const board = await createBoard({ title: 'Old' })
    const details = await getBoard({ boardId: board.id })
    expect(details.lists).toEqual([])

    const updated = await updateBoard({ boardId: board.id, title: 'New' })
    expect(updated.title).toBe('New')

    await deleteBoard({ boardId: board.id })
    await expect(getBoard({ boardId: board.id })).rejects.toBeInstanceOf(NotFoundError)
  })

  it('throws not found for missing board operations', async () => {
    const missing = '99999999-9999-4999-8999-999999999999'
    await expect(makeGetBoard({ repository })({ boardId: missing })).rejects.toBeInstanceOf(
      NotFoundError,
    )
    await expect(
      makeUpdateBoard({ repository })({ boardId: missing, title: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundError)
    await expect(makeDeleteBoard({ repository })({ boardId: missing })).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  it('creates lists with default position and updates/deletes them', async () => {
    const board = await makeCreateBoard({ repository })({ title: 'B' })
    const createList = makeCreateList({ repository })
    const updateList = makeUpdateList({ repository })
    const deleteList = makeDeleteList({ repository })

    const first = await createList({ boardId: board.id, title: 'L1' })
    const second = await createList({ boardId: board.id, title: 'L2' })
    expect(first.position).toBe(0)
    expect(second.position).toBe(1)

    const renamed = await updateList({ listId: first.id, title: 'L1b' })
    expect(renamed.title).toBe('L1b')

    await deleteList({ listId: first.id })
    await expect(updateList({ listId: first.id, title: 'gone' })).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  it('creates cards with default position and updates/deletes them', async () => {
    const board = await makeCreateBoard({ repository })({ title: 'B' })
    const list = await makeCreateList({ repository })({ boardId: board.id, title: 'L' })
    const createCard = makeCreateCard({ repository })
    const updateCard = makeUpdateCard({ repository })
    const deleteCard = makeDeleteCard({ repository })

    const first = await createCard({ listId: list.id, title: 'C1' })
    const second = await createCard({ listId: list.id, title: 'C2', description: 'd' })
    expect(first.position).toBe(0)
    expect(second.position).toBe(1)

    const updated = await updateCard({ cardId: first.id, title: 'C1b', description: 'x' })
    expect(updated).toMatchObject({ title: 'C1b', description: 'x' })

    await deleteCard({ cardId: first.id })
    await expect(updateCard({ cardId: first.id, title: 'gone' })).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  it('moves a card within the same board and publishes event', async () => {
    const handler = vi.fn()
    eventBus.subscribe(CARD_MOVED, handler)

    const board = await makeCreateBoard({ repository })({ title: 'B' })
    const listA = await makeCreateList({ repository })({ boardId: board.id, title: 'A' })
    const listB = await makeCreateList({ repository })({ boardId: board.id, title: 'B' })
    const card = await makeCreateCard({ repository })({ listId: listA.id, title: 'Card' })

    const moveCard = makeMoveCard({ repository, eventBus })
    const moved = await moveCard({ cardId: card.id, listId: listB.id, position: 0 })

    expect(moved).toMatchObject({ listId: listB.id, position: 0 })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        cardId: card.id,
        fromListId: listA.id,
        toListId: listB.id,
        boardId: board.id,
      }),
    )
  })

  it('rejects moving a card across boards', async () => {
    const boardA = await makeCreateBoard({ repository })({ title: 'A' })
    const boardB = await makeCreateBoard({ repository })({ title: 'B' })
    const listA = await makeCreateList({ repository })({ boardId: boardA.id, title: 'LA' })
    const listB = await makeCreateList({ repository })({ boardId: boardB.id, title: 'LB' })
    const card = await makeCreateCard({ repository })({ listId: listA.id, title: 'Card' })

    const moveCard = makeMoveCard({ repository, eventBus })
    await expect(
      moveCard({ cardId: card.id, listId: listB.id, position: 0 }),
    ).rejects.toBeInstanceOf(DomainError)
  })

  it('throws not found for missing list/card create targets', async () => {
    const missing = '99999999-9999-4999-8999-999999999999'
    await expect(
      makeCreateList({ repository })({ boardId: missing, title: 'L' }),
    ).rejects.toBeInstanceOf(NotFoundError)
    await expect(
      makeCreateCard({ repository })({ listId: missing, title: 'C' }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
