export function createInMemoryBoardRepository() {
  /** @type {Map<string, { id: string, title: string, createdAt: string }>} */
  const boards = new Map()
  /** @type {Map<string, { id: string, boardId: string, title: string, position: number }>} */
  const lists = new Map()
  /** @type {Map<string, { id: string, listId: string, title: string, description: string, position: number }>} */
  const cards = new Map()

  function reindexListCards(listId) {
    const ordered = [...cards.values()]
      .filter((card) => card.listId === listId)
      .sort((a, b) => a.position - b.position)
    ordered.forEach((card, index) => {
      cards.set(card.id, { ...card, position: index })
    })
  }

  return {
    reset() {
      boards.clear()
      lists.clear()
      cards.clear()
    },

    async listBoards() {
      return [...boards.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },

    async findBoardById(id) {
      const board = boards.get(id)
      if (!board) return null

      const boardLists = [...lists.values()]
        .filter((list) => list.boardId === id)
        .sort((a, b) => a.position - b.position)
        .map((list) => ({
          ...list,
          cards: [...cards.values()]
            .filter((card) => card.listId === list.id)
            .sort((a, b) => a.position - b.position),
        }))

      return {
        ...board,
        lists: boardLists,
      }
    },

    async saveBoard(board) {
      const saved = {
        id: board.id,
        title: board.title,
        createdAt: board.createdAt ?? new Date().toISOString(),
      }
      boards.set(saved.id, saved)
      return saved
    },

    async updateBoard(board) {
      const existing = boards.get(board.id)
      if (!existing) return board
      const saved = { ...existing, title: board.title }
      boards.set(board.id, saved)
      return saved
    },

    async deleteBoard(id) {
      if (!boards.has(id)) return false
      const listIds = [...lists.values()]
        .filter((list) => list.boardId === id)
        .map((list) => list.id)
      for (const listId of listIds) {
        for (const card of [...cards.values()]) {
          if (card.listId === listId) cards.delete(card.id)
        }
        lists.delete(listId)
      }
      boards.delete(id)
      return true
    },

    async findListById(listId) {
      return lists.get(listId) ?? null
    },

    async countListsByBoard(boardId) {
      return [...lists.values()].filter((list) => list.boardId === boardId).length
    },

    async saveList(list) {
      lists.set(list.id, { ...list })
      return list
    },

    async updateList(list) {
      lists.set(list.id, { ...list })
      return list
    },

    async deleteList(id) {
      if (!lists.has(id)) return false
      for (const card of [...cards.values()]) {
        if (card.listId === id) cards.delete(card.id)
      }
      lists.delete(id)
      return true
    },

    async findCardById(cardId) {
      return cards.get(cardId) ?? null
    },

    async countCardsByList(listId) {
      return [...cards.values()].filter((card) => card.listId === listId).length
    },

    async saveCard(card) {
      cards.set(card.id, { ...card })
      return card
    },

    async updateCard(card) {
      cards.set(card.id, { ...card })
      return card
    },

    async deleteCard(id) {
      return cards.delete(id)
    },

    async moveCard({ cardId, fromListId, toListId, toPosition }) {
      const card = cards.get(cardId)
      if (!card) return null

      cards.delete(cardId)
      reindexListCards(fromListId)

      const targetCards = [...cards.values()]
        .filter((item) => item.listId === toListId)
        .sort((a, b) => a.position - b.position)

      targetCards.splice(toPosition, 0, {
        ...card,
        listId: toListId,
        position: toPosition,
      })

      targetCards.forEach((item, index) => {
        cards.set(item.id, { ...item, listId: toListId, position: index })
      })

      return cards.get(cardId)
    },
  }
}
