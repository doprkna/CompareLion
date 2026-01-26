class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
    }
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    once(event, handler) {
        const onceHandler = (payload) => {
            handler(payload);
            this.off(event, onceHandler);
        };
        this.on(event, onceHandler);
    }
    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(payload));
        }
    }
}
export const eventBus = new EventBus();
