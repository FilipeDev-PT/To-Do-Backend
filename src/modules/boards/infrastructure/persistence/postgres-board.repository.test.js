import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

const hasDatabase = Boolean(process.env.DATABASE_URL)

describe.skipIf(!hasDatabase)('postgres board repository', () => {
  /** @type {ReturnType<typeof import('./postgres-board.repository.js').createPostgresBoardRepository>} */
  let repository
  /** @type {string[]} */
  const createdBoardIds = []

  beforeAll(async () => {
    const mod = await import('./postgres-board.repository.js')
    repository = mod.createPostgresBoardRepository()
  })

  afterEach(async () => {
    while (createdBoardIds.length > 0) {
      const id = createdBoardIds.pop()
      await repository.deleteBoard(id)
    }
  })

  it('saves and finds a board with lists/cards', async () => {
    const boardId = randomUUID()
    const listId = randomUUID()
    const cardId = randomUUID()
    createdBoardIds.push(boardId)

    await repository.saveBoard({
      id: boardId,
      title: `Repo Test ${boardId.slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    })
    await repository.saveList({
      id: listId,
      boardId,
      title: 'List',
      position: 0,
    })
    await repository.saveCard({
      id: cardId,
      listId,
      title: 'Card',
      description: 'desc',
      position: 0,
    })

    const details = await repository.findBoardById(boardId)
    expect(details).toMatchObject({
      id: boardId,
      lists: [
        expect.objectContaining({
          id: listId,
          cards: [expect.objectContaining({ id: cardId, title: 'Card' })],
        }),
      ],
    })
  })

  it('moves a card and reindexes positions', async () => {
    const boardId = randomUUID()
    const listA = randomUUID()
    const listB = randomUUID()
    const card1 = randomUUID()
    const card2 = randomUUID()
    createdBoardIds.push(boardId)

    await repository.saveBoard({
      id: boardId,
      title: `Move Test ${boardId.slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    })
    await repository.saveList({ id: listA, boardId, title: 'A', position: 0 })
    await repository.saveList({ id: listB, boardId, title: 'B', position: 1 })
    await repository.saveCard({
      id: card1,
      listId: listA,
      title: 'C1',
      description: '',
      position: 0,
    })
    await repository.saveCard({
      id: card2,
      listId: listA,
      title: 'C2',
      description: '',
      position: 1,
    })

    const moved = await repository.moveCard({
      cardId: card1,
      fromListId: listA,
      toListId: listB,
      toPosition: 0,
    })
    expect(moved).toMatchObject({ id: card1, listId: listB, position: 0 })

    const details = await repository.findBoardById(boardId)
    const source = details.lists.find((list) => list.id === listA)
    const target = details.lists.find((list) => list.id === listB)
    expect(source.cards.map((card) => card.id)).toEqual([card2])
    expect(source.cards[0].position).toBe(0)
    expect(target.cards.map((card) => card.id)).toEqual([card1])
  })

  it('cascades delete from board to lists and cards', async () => {
    const boardId = randomUUID()
    const listId = randomUUID()
    const cardId = randomUUID()

    await repository.saveBoard({
      id: boardId,
      title: `Cascade ${boardId.slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    })
    await repository.saveList({ id: listId, boardId, title: 'L', position: 0 })
    await repository.saveCard({
      id: cardId,
      listId,
      title: 'C',
      description: '',
      position: 0,
    })

    const deleted = await repository.deleteBoard(boardId)
    expect(deleted).toBe(true)
    expect(await repository.findBoardById(boardId)).toBeNull()
    expect(await repository.findListById(listId)).toBeNull()
    expect(await repository.findCardById(cardId)).toBeNull()
  })
})
