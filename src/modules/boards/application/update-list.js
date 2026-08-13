import { NotFoundError } from '../../../shared/errors.js'
import { updateList } from '../domain/list.js'

export function makeUpdateList({ repository }) {
  return async function updateListUseCase({ listId, title, position }) {
    const list = await repository.findListById(listId)
    if (!list) {
      throw new NotFoundError('List not found')
    }

    const updated = updateList(list, { title, position })
    return repository.updateList(updated)
  }
}
