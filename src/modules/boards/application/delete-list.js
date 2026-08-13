import { NotFoundError } from '../../../shared/errors.js'

export function makeDeleteList({ repository }) {
  return async function deleteListUseCase({ listId }) {
    const deleted = await repository.deleteList(listId)
    if (!deleted) {
      throw new NotFoundError('List not found')
    }
  }
}
