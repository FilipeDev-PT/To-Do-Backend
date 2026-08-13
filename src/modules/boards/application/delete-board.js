import { NotFoundError } from '../../../shared/errors.js'

export function makeDeleteBoard({ repository }) {
  return async function deleteBoardUseCase({ boardId }) {
    const deleted = await repository.deleteBoard(boardId)
    if (!deleted) {
      throw new NotFoundError('Board not found')
    }
  }
}
