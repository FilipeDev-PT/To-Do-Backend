import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/errors.js'

export function createList({ boardId, title, position = 0 }) {
  if (!boardId) {
    throw new DomainError('List must belong to a board')
  }

  return {
    id: randomUUID(),
    boardId,
    title: normalizeTitle(title),
    position: normalizePosition(position),
  }
}

export function updateList(list, { title, position } = {}) {
  return {
    ...list,
    title: title === undefined ? list.title : normalizeTitle(title),
    position: position === undefined ? list.position : normalizePosition(position),
  }
}

function normalizeTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new DomainError('List title is required')
  }
  return title.trim()
}

function normalizePosition(position) {
  const value = Number(position)
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError('List position must be a non-negative integer')
  }
  return value
}
