import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildTestApp } from '../../../../test/build-test-app.js'

describe('boards HTTP regression', () => {
  /** @type {Awaited<ReturnType<typeof buildTestApp>>} */
  let ctx

  beforeEach(async () => {
    ctx = await buildTestApp()
  })

  afterEach(async () => {
    await ctx.app.close()
  })

  it('returns healthz', async () => {
    const response = await ctx.app.inject({ method: 'GET', url: '/healthz' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })

  it('echoes x-request-id', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/healthz',
      headers: { 'x-request-id': 'test-request-id' },
    })
    expect(response.headers['x-request-id']).toBe('test-request-id')
  })

  it('runs board CRUD', async () => {
    const created = await ctx.app.inject({
      method: 'POST',
      url: '/boards',
      payload: { title: 'Board' },
    })
    expect(created.statusCode).toBe(201)
    const board = created.json()

    const list = await ctx.app.inject({ method: 'GET', url: '/boards' })
    expect(list.json()).toEqual(expect.arrayContaining([expect.objectContaining({ id: board.id })]))

    const detail = await ctx.app.inject({ method: 'GET', url: `/boards/${board.id}` })
    expect(detail.statusCode).toBe(200)
    expect(detail.json().lists).toEqual([])

    const patched = await ctx.app.inject({
      method: 'PATCH',
      url: `/boards/${board.id}`,
      payload: { title: 'Board 2' },
    })
    expect(patched.json().title).toBe('Board 2')

    const deleted = await ctx.app.inject({ method: 'DELETE', url: `/boards/${board.id}` })
    expect(deleted.statusCode).toBe(204)
  })

  it('runs list/card CRUD and move', async () => {
    const board = (
      await ctx.app.inject({ method: 'POST', url: '/boards', payload: { title: 'B' } })
    ).json()

    const listA = (
      await ctx.app.inject({
        method: 'POST',
        url: `/boards/${board.id}/lists`,
        payload: { title: 'A' },
      })
    ).json()
    const listB = (
      await ctx.app.inject({
        method: 'POST',
        url: `/boards/${board.id}/lists`,
        payload: { title: 'B' },
      })
    ).json()

    const card = (
      await ctx.app.inject({
        method: 'POST',
        url: `/lists/${listA.id}/cards`,
        payload: { title: 'Card', description: 'd' },
      })
    ).json()

    const patchedList = await ctx.app.inject({
      method: 'PATCH',
      url: `/lists/${listA.id}`,
      payload: { title: 'A2' },
    })
    expect(patchedList.json().title).toBe('A2')

    const patchedCard = await ctx.app.inject({
      method: 'PATCH',
      url: `/cards/${card.id}`,
      payload: { title: 'Card 2' },
    })
    expect(patchedCard.json().title).toBe('Card 2')

    const moved = await ctx.app.inject({
      method: 'POST',
      url: `/cards/${card.id}/move`,
      payload: { listId: listB.id, position: 0 },
    })
    expect(moved.statusCode).toBe(200)
    expect(moved.json()).toMatchObject({ listId: listB.id, position: 0 })

    const details = (
      await ctx.app.inject({ method: 'GET', url: `/boards/${board.id}` })
    ).json()
    const target = details.lists.find((list) => list.id === listB.id)
    expect(target.cards.map((item) => item.id)).toEqual([card.id])

    const deletedCard = await ctx.app.inject({ method: 'DELETE', url: `/cards/${card.id}` })
    expect(deletedCard.statusCode).toBe(204)

    const deletedList = await ctx.app.inject({ method: 'DELETE', url: `/lists/${listA.id}` })
    expect(deletedList.statusCode).toBe(204)
  })

  it('returns validation errors', async () => {
    const badUuid = await ctx.app.inject({ method: 'GET', url: '/boards/not-a-uuid' })
    expect(badUuid.statusCode).toBe(400)
    expect(badUuid.json().code).toBe('VALIDATION_ERROR')

    const badBody = await ctx.app.inject({
      method: 'POST',
      url: '/boards',
      payload: { title: '' },
    })
    expect(badBody.statusCode).toBe(400)
    expect(badBody.json().code).toBe('VALIDATION_ERROR')
  })

  it('returns not found', async () => {
    const missing = '99999999-9999-4999-8999-999999999999'
    const response = await ctx.app.inject({ method: 'GET', url: `/boards/${missing}` })
    expect(response.statusCode).toBe(404)
    expect(response.json().code).toBe('NOT_FOUND')
  })

  it('returns domain error when moving across boards', async () => {
    const boardA = (
      await ctx.app.inject({ method: 'POST', url: '/boards', payload: { title: 'A' } })
    ).json()
    const boardB = (
      await ctx.app.inject({ method: 'POST', url: '/boards', payload: { title: 'B' } })
    ).json()
    const listA = (
      await ctx.app.inject({
        method: 'POST',
        url: `/boards/${boardA.id}/lists`,
        payload: { title: 'LA' },
      })
    ).json()
    const listB = (
      await ctx.app.inject({
        method: 'POST',
        url: `/boards/${boardB.id}/lists`,
        payload: { title: 'LB' },
      })
    ).json()
    const card = (
      await ctx.app.inject({
        method: 'POST',
        url: `/lists/${listA.id}/cards`,
        payload: { title: 'Card' },
      })
    ).json()

    const response = await ctx.app.inject({
      method: 'POST',
      url: `/cards/${card.id}/move`,
      payload: { listId: listB.id, position: 0 },
    })
    expect(response.statusCode).toBe(422)
    expect(response.json().code).toBe('DOMAIN_ERROR')
  })
})
