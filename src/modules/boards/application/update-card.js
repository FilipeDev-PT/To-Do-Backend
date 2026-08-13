import { NotFoundError } from '../../../shared/errors.js'
import { updateCard } from '../domain/card.js'

export function makeUpdateCard({ repository }) {
  return async function updateCardUseCase({ cardId, title, description }) {
    const card = await repository.findCardById(cardId)
    if (!card) {
      throw new NotFoundError('Card not found')
    }

    const updated = updateCard(card, { title, description })
    return repository.updateCard(updated)
  }
}
