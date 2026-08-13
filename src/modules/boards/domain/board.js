import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/errors.js'

export function createBoard({ title }) {
  const normalized = normalizeTitle(title)
  return {
    id: randomUUID(),
    title: normalized,
    createdAt: new Date().toISOString(),
  }
}

export function renameBoard(board, title) {
  return {
    ...board,
    title: normalizeTitle(title),
  }
}

function normalizeTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new DomainError('Board title is required')
  }
  return title.trim()
}
