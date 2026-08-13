import { DomainError, NotFoundError } from '../../../shared/errors.js'
import { moveCard as applyMove } from '../domain/card.js'

export const CARD_MOVED = 'CardMoved'

export function makeMoveCard({ repository, eventBus }) {
  return async function moveCardUseCase({ cardId, listId, position }) {
    const card = await repository.findCardById(cardId)
    if (!card) {
      throw new NotFoundError('Card not found')
    }

    const targetList = await repository.findListById(listId)
    if (!targetList) {
      throw new NotFoundError('Target list not found')
    }

    const sourceList = await repository.findListById(card.listId)
    if (!sourceList) {
      throw new NotFoundError('Source list not found')
    }

    if (sourceList.boardId !== targetList.boardId) {
      throw new DomainError('Cannot move card to a list on a different board')
    }

    const moved = applyMove(card, { listId, position })
    const saved = await repository.moveCard({
      cardId,
      fromListId: card.listId,
      toListId: moved.listId,
      toPosition: moved.position,
    })

    await eventBus.publish(CARD_MOVED, {
      cardId: saved.id,
      fromListId: card.listId,
      toListId: saved.listId,
      position: saved.position,
      boardId: targetList.boardId,
    })

    return saved
  }
}
