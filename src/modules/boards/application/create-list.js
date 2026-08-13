import { NotFoundError } from '../../../shared/errors.js'
import { createList } from '../domain/list.js'

export function makeCreateList({ repository }) {
  return async function createListUseCase({ boardId, title, position }) {
    const board = await repository.findBoardById(boardId)
    if (!board) {
      throw new NotFoundError('Board not found')
    }

    const nextPosition = position ?? await repository.countListsByBoard(boardId)
    const list = createList({ boardId, title, position: nextPosition })
    return repository.saveList(list)
  }
}
