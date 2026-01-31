type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// App-wide events
export const AppEvents = {
  ACTIVITIES_UPDATED: "activities:updated",
  PROFILE_UPDATED: "profile:updated",
  RESIDENCE_UPDATED: "residence:updated",
  MEMBERSHIP_UPDATED: "membership:updated",
  PERMISSIONS_UPDATED: "permissions:updated",
  RESIDENCE_INVITES_UPDATED: "residence_invites:updated",
  INVITATION_ACCEPTED: "invitation:accepted",
  INVITATION_REJECTED: "invitation:rejected",
  GUEST_INVITATION_CREATED: "guest_invitation:created",
  GUARD_UPDATED: "guard:updated",
  SHIFT_UPDATED: "shift:updated",
} as const;

export type AppEventType = typeof AppEvents[keyof typeof AppEvents];

export const appEventEmitter = new EventEmitter();
