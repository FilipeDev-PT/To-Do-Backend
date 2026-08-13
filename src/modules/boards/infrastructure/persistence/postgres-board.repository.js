import { sql } from '../../../../shared/db.js'

function mapBoard(row) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at,
  }
}

function mapList(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    position: row.position,
  }
}

function mapCard(row) {
  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    description: row.description ?? '',
    position: row.position,
  }
}

export function createPostgresBoardRepository() {
  return {
    async listBoards() {
      const rows = await sql`SELECT id, title, created_at FROM boards ORDER BY created_at DESC`
      return rows.map(mapBoard)
    },

    async findBoardById(id) {
      const boards = await sql`SELECT id, title, created_at FROM boards WHERE id = ${id}`
      if (boards.length === 0) {
        return null
      }

      const board = mapBoard(boards[0])
      const lists = await sql`
        SELECT id, board_id, title, position
        FROM lists
        WHERE board_id = ${id}
        ORDER BY position ASC
      `

      const cards = await sql`
        SELECT c.id, c.list_id, c.title, c.description, c.position
        FROM cards c
        INNER JOIN lists l ON l.id = c.list_id
        WHERE l.board_id = ${id}
        ORDER BY c.position ASC
      `

      const cardsByList = new Map()
      for (const card of cards) {
        const mapped = mapCard(card)
        if (!cardsByList.has(mapped.listId)) {
          cardsByList.set(mapped.listId, [])
        }
        cardsByList.get(mapped.listId).push(mapped)
      }

      return {
        ...board,
        lists: lists.map((list) => {
          const mapped = mapList(list)
          return {
            ...mapped,
            cards: cardsByList.get(mapped.id) ?? [],
          }
        }),
      }
    },

    async saveBoard(board) {
      await sql`
        INSERT INTO boards (id, title)
        VALUES (${board.id}, ${board.title})
      `
      const rows = await sql`SELECT id, title, created_at FROM boards WHERE id = ${board.id}`
      return mapBoard(rows[0])
    },

    async updateBoard(board) {
      await sql`
        UPDATE boards
        SET title = ${board.title}
        WHERE id = ${board.id}
      `
      const rows = await sql`SELECT id, title, created_at FROM boards WHERE id = ${board.id}`
      return mapBoard(rows[0])
    },

    async deleteBoard(id) {
      const rows = await sql`DELETE FROM boards WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async findListById(listId) {
      const rows = await sql`
        SELECT id, board_id, title, position
        FROM lists
        WHERE id = ${listId}
      `
      return rows.length === 0 ? null : mapList(rows[0])
    },

    async countListsByBoard(boardId) {
      const rows = await sql`
        SELECT COUNT(*)::int AS count
        FROM lists
        WHERE board_id = ${boardId}
      `
      return rows[0].count
    },

    async saveList(list) {
      await sql`
        INSERT INTO lists (id, board_id, title, position)
        VALUES (${list.id}, ${list.boardId}, ${list.title}, ${list.position})
      `
      return list
    },

    async updateList(list) {
      await sql`
        UPDATE lists
        SET title = ${list.title}, position = ${list.position}
        WHERE id = ${list.id}
      `
      return list
    },

    async deleteList(id) {
      const rows = await sql`DELETE FROM lists WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async findCardById(cardId) {
      const rows = await sql`
        SELECT id, list_id, title, description, position
        FROM cards
        WHERE id = ${cardId}
      `
      return rows.length === 0 ? null : mapCard(rows[0])
    },

    async countCardsByList(listId) {
      const rows = await sql`
        SELECT COUNT(*)::int AS count
        FROM cards
        WHERE list_id = ${listId}
      `
      return rows[0].count
    },

    async saveCard(card) {
      await sql`
        INSERT INTO cards (id, list_id, title, description, position)
        VALUES (${card.id}, ${card.listId}, ${card.title}, ${card.description}, ${card.position})
      `
      return card
    },

    async updateCard(card) {
      await sql`
        UPDATE cards
        SET title = ${card.title}, description = ${card.description}
        WHERE id = ${card.id}
      `
      return card
    },

    async deleteCard(id) {
      const rows = await sql`DELETE FROM cards WHERE id = ${id} RETURNING id`
      return rows.length > 0
    },

    async moveCard({ cardId, fromListId, toListId, toPosition }) {
      const cards = await sql`
        SELECT id, list_id, title, description, position
        FROM cards
        WHERE id = ${cardId}
      `
      if (cards.length === 0) {
        return null
      }

      // Close gap in source list
      await sql`
        UPDATE cards
        SET position = position - 1
        WHERE list_id = ${fromListId}
          AND position > ${cards[0].position}
          AND id <> ${cardId}
      `

      // Make room in target list
      await sql`
        UPDATE cards
        SET position = position + 1
        WHERE list_id = ${toListId}
          AND position >= ${toPosition}
          AND id <> ${cardId}
      `

      await sql`
        UPDATE cards
        SET list_id = ${toListId}, position = ${toPosition}
        WHERE id = ${cardId}
      `

      const updated = await sql`
        SELECT id, list_id, title, description, position
        FROM cards
        WHERE id = ${cardId}
      `
      return mapCard(updated[0])
    },
  }
}
