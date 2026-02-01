let listeners = new Map();

export function registerListener(origin) {
  const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  listeners.set(id, { origin, start: Date.now() });
  console.debug(`ListenerDebug: registered ${id} origin=${origin} total=${listeners.size}`);
  return id;
}

export function unregisterListener(id) {
  if (!id) return;
  if (listeners.has(id)) {
    listeners.delete(id);
    console.debug(`ListenerDebug: unregistered ${id} total=${listeners.size}`);
  } else {
    console.debug(`ListenerDebug: attempted to unregister missing ${id} total=${listeners.size}`);
  }
}

export function getActiveListeners() {
  return Array.from(listeners.entries()).map(([id, info]) => ({ id, ...info }));
}

// Useful for inspecting from console during debugging
if (typeof window !== 'undefined') {
  window.__LISTENER_DEBUG = {
    getActiveListeners,
    unregisterListener,
    registerListener
  };
}
