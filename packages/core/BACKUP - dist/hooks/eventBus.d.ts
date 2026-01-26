type EventHandler = (payload?: any) => void;
declare class EventBus {
    private listeners;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler: EventHandler): void;
    once(event: string, handler: EventHandler): void;
    emit(event: string, payload?: any): void;
}
export declare const eventBus: EventBus;
export {};
