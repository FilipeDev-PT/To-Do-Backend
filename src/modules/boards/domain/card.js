import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/errors.js'

export function createCard({ listId, title, description = '', position = 0 }) {
  if (!listId) {
    throw new DomainError('Card must belong to a list')
  }

  return {
    id: randomUUID(),
    listId,
    title: normalizeTitle(title),
    description: normalizeDescription(description),
    position: normalizePosition(position),
  }
}

export function updateCard(card, { title, description } = {}) {
  return {
    ...card,
    title: title === undefined ? card.title : normalizeTitle(title),
    description: description === undefined
      ? card.description
      : normalizeDescription(description),
  }
}

export function moveCard(card, { listId, position }) {
  if (!listId) {
    throw new DomainError('Target listId is required to move a card')
  }

  return {
    ...card,
    listId,
    position: normalizePosition(position),
  }
}

function normalizeTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new DomainError('Card title is required')
  }
  return title.trim()
}

function normalizeDescription(description) {
  if (description == null) {
    return ''
  }
  if (typeof description !== 'string') {
    throw new DomainError('Card description must be a string')
  }
  return description
}

function normalizePosition(position) {
  const value = Number(position)
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError('Card position must be a non-negative integer')
  }
  return value
}
