import {
  boardIdParams,
  cardIdParams,
  createBoardBody,
  createCardBody,
  createListBody,
  listIdParams,
  moveCardBody,
  parseOrThrow,
  updateBoardBody,
  updateCardBody,
  updateListBody,
} from './boards.schemas.js'

export function createBoardsController(useCases) {
  return {
    async createBoard(request, reply) {
      const body = parseOrThrow(createBoardBody, request.body)
      const board = await useCases.createBoard(body)
      return reply.status(201).send(board)
    },

    async listBoards(_request, reply) {
      const boards = await useCases.listBoards()
      return reply.send(boards)
    },

    async getBoard(request, reply) {
      const { boardId } = parseOrThrow(boardIdParams, request.params)
      const board = await useCases.getBoard({ boardId })
      return reply.send(board)
    },

    async updateBoard(request, reply) {
      const { boardId } = parseOrThrow(boardIdParams, request.params)
      const body = parseOrThrow(updateBoardBody, request.body)
      const board = await useCases.updateBoard({ boardId, ...body })
      return reply.send(board)
    },

    async deleteBoard(request, reply) {
      const { boardId } = parseOrThrow(boardIdParams, request.params)
      await useCases.deleteBoard({ boardId })
      return reply.status(204).send()
    },

    async createList(request, reply) {
      const { boardId } = parseOrThrow(boardIdParams, request.params)
      const body = parseOrThrow(createListBody, request.body)
      const list = await useCases.createList({ boardId, ...body })
      return reply.status(201).send(list)
    },

    async updateList(request, reply) {
      const { listId } = parseOrThrow(listIdParams, request.params)
      const body = parseOrThrow(updateListBody, request.body)
      const list = await useCases.updateList({ listId, ...body })
      return reply.send(list)
    },

    async deleteList(request, reply) {
      const { listId } = parseOrThrow(listIdParams, request.params)
      await useCases.deleteList({ listId })
      return reply.status(204).send()
    },

    async createCard(request, reply) {
      const { listId } = parseOrThrow(listIdParams, request.params)
      const body = parseOrThrow(createCardBody, request.body)
      const card = await useCases.createCard({ listId, ...body })
      return reply.status(201).send(card)
    },

    async updateCard(request, reply) {
      const { cardId } = parseOrThrow(cardIdParams, request.params)
      const body = parseOrThrow(updateCardBody, request.body)
      const card = await useCases.updateCard({ cardId, ...body })
      return reply.send(card)
    },

    async deleteCard(request, reply) {
      const { cardId } = parseOrThrow(cardIdParams, request.params)
      await useCases.deleteCard({ cardId })
      return reply.status(204).send()
    },

    async moveCard(request, reply) {
      const { cardId } = parseOrThrow(cardIdParams, request.params)
      const body = parseOrThrow(moveCardBody, request.body)
      const card = await useCases.moveCard({ cardId, ...body })
      return reply.send(card)
    },
  }
}
