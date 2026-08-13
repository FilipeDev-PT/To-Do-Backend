import { NotFoundError } from '../../../shared/errors.js'
import { renameBoard } from '../domain/board.js'

export function makeUpdateBoard({ repository }) {
  return async function updateBoardUseCase({ boardId, title }) {
    const board = await repository.findBoardById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const updated = renameBoard(
      { id: board.id, title: board.title, createdAt: board.createdAt },
      title,
    )
    return repository.updateBoard(updated)
  }
}
