import { NotFoundError } from '../../../shared/errors.js'
import { createCard } from '../domain/card.js'

export function makeCreateCard({ repository }) {
  return async function createCardUseCase({ listId, title, description, position }) {
    const list = await repository.findListById(listId)
    if (!list) {
      throw new NotFoundError('List not found')
    }

    const nextPosition = position ?? await repository.countCardsByList(listId)
    const card = createCard({ listId, title, description, position: nextPosition })
    return repository.saveCard(card)
  }
}
