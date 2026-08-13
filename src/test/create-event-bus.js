export function createEventBus() {
  const listeners = new Map()

  return {
    subscribe(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set())
      }
      listeners.get(eventName).add(handler)
      return () => listeners.get(eventName)?.delete(handler)
    },

    async publish(eventName, payload) {
      const handlers = listeners.get(eventName)
      if (!handlers || handlers.size === 0) {
        return
      }
      await Promise.all([...handlers].map((handler) => handler(payload)))
    },
  }
}
