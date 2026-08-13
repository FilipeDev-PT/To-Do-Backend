export async function boardsRoutes(fastify, { controller }) {
  fastify.post('/boards', controller.createBoard)
  fastify.get('/boards', controller.listBoards)
  fastify.get('/boards/:boardId', controller.getBoard)
  fastify.patch('/boards/:boardId', controller.updateBoard)
  fastify.delete('/boards/:boardId', controller.deleteBoard)

  fastify.post('/boards/:boardId/lists', controller.createList)
  fastify.patch('/lists/:listId', controller.updateList)
  fastify.delete('/lists/:listId', controller.deleteList)

  fastify.post('/lists/:listId/cards', controller.createCard)
  fastify.patch('/cards/:cardId', controller.updateCard)
  fastify.delete('/cards/:cardId', controller.deleteCard)
  fastify.post('/cards/:cardId/move', controller.moveCard)
}
