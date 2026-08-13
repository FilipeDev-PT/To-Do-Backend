import { NotFoundError } from '../../../shared/errors.js'

export function makeDeleteCard({ repository }) {
  return async function deleteCardUseCase({ cardId }) {
    const deleted = await repository.deleteCard(cardId)
    if (!deleted) {
      throw new NotFoundError('Card not found')
    }
  }
}
