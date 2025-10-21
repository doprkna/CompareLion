/**
 * Event Bus System
 * 
 * Internal event broadcasting for real-time updates across the app.
 * Uses Node.js EventEmitter for in-process communication.
 * 
 * Events:
 * - message:new - New message sent
 * - xp:update - XP updated for user
 * - activity:new - New activity logged
 * - achievement:unlock - Achievement unlocked
 * - level:up - User leveled up
 */

import { EventEmitter } from "events";

// Create global emitter instance
const emitter = new EventEmitter();

// Increase max listeners to prevent warnings in development
emitter.setMaxListeners(100);

/**
 * Event Bus Interface
 */
export const eventBus = {
  /**
   * Subscribe to an event
   * @param event Event name
   * @param listener Callback function
   */
  on: (event: string, listener: (...args: any[]) => void) => {
    emitter.on(event, listener);
  },

  /**
   * Unsubscribe from an event
   * @param event Event name
   * @param listener Callback function
   */
  off: (event: string, listener: (...args: any[]) => void) => {
    emitter.off(event, listener);
  },

  /**
   * Emit an event with payload
   * @param event Event name
   * @param payload Event data
   */
  emit: (event: string, payload: any) => {
    console.log(`[EventBus] Emitting ${event}:`, payload);
    emitter.emit(event, payload);
  },

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   * @param event Event name
   * @param listener Callback function
   */
  once: (event: string, listener: (...args: any[]) => void) => {
    emitter.once(event, listener);
  },

  /**
   * Remove all listeners for an event
   * @param event Event name (optional, removes all if not provided)
   */
  removeAllListeners: (event?: string) => {
    emitter.removeAllListeners(event);
  },
};

// Event type definitions for TypeScript
export interface MessageNewEvent {
  senderId: string;
  senderEmail: string;
  receiverId: string;
  receiverEmail: string;
  content: string;
}

export interface XpUpdateEvent {
  userId: string;
  newXp: number;
  oldXp: number;
  gain: number;
  source: string;
}

export interface ActivityNewEvent {
  userId: string;
  type: string;
  title: string;
  description?: string;
}

export interface AchievementUnlockEvent {
  userId: string;
  achievementCode: string;
  achievementTitle: string;
  xpReward: number;
}

export interface LevelUpEvent {
  userId: string;
  newLevel: number;
  oldLevel: number;
}











