import { NotFoundError } from '../../../shared/errors.js'

export function makeGetBoard({ repository }) {
  return async function getBoardUseCase({ boardId }) {
    const board = await repository.findBoardById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }
    return board
  }
}
