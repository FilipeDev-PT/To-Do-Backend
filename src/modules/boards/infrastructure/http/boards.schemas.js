import { z } from 'zod'
import { ValidationError } from '../../../../shared/errors.js'

export const boardIdParams = z.object({
  boardId: z.string().uuid(),
})

export const listIdParams = z.object({
  listId: z.string().uuid(),
})

export const cardIdParams = z.object({
  cardId: z.string().uuid(),
})

export const createBoardBody = z.object({
  title: z.string().min(1),
})

export const updateBoardBody = z.object({
  title: z.string().min(1),
})

export const createListBody = z.object({
  title: z.string().min(1),
  position: z.number().int().min(0).optional(),
})

export const updateListBody = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
}).refine((data) => data.title !== undefined || data.position !== undefined, {
  message: 'At least one of title or position is required',
})

export const createCardBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
})

export const updateCardBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
}).refine((data) => data.title !== undefined || data.description !== undefined, {
  message: 'At least one of title or description is required',
})

export const moveCardBody = z.object({
  listId: z.string().uuid(),
  position: z.number().int().min(0),
})

export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ')
    throw new ValidationError(message, result.error.issues)
  }
  return result.data
}
