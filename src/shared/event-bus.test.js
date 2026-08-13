import { describe, expect, it, vi } from 'vitest'
import { createEventBus } from '../test/create-event-bus.js'
import { eventBus } from './event-bus.js'

describe('eventBus', () => {
  it('publishes to subscribers (factory)', async () => {
    const bus = createEventBus()
    const handler = vi.fn()
    const unsubscribe = bus.subscribe('Ping', handler)

    await bus.publish('Ping', { ok: true })
    expect(handler).toHaveBeenCalledWith({ ok: true })

    unsubscribe()
    await bus.publish('Ping', { ok: false })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('no-ops when there are no listeners', async () => {
    await expect(eventBus.publish('UnusedEvent', {})).resolves.toBeUndefined()
  })
})
