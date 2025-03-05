// EventBus.ts

/**
 * Event bus class for profile-related events
 * Provides event subscription and publishing functionality
 */
class ProfileEventBus {
    /** Map of event names to their callback functions */
    private listeners: { [event: string]: Array<(data?: any) => void> } = {};

    /**
     * Subscribe to an event
     * @param event Event name to subscribe to
     * @param callback Function to be called when event is emitted
     */
    public on(event: string, callback: (data?: any) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Emit an event with optional data
     * @param event Event name to emit
     * @param data Optional data to pass to event listeners
     */
    public emit(event: string, data?: any): void {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Unsubscribe from an event
     * @param event Event name to unsubscribe from
     * @param callback Function to remove from event listeners
     */
    public off(event: string, callback: (data?: any) => void): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
}

/**
 * Global instance of ProfileEventBus
 * Used for profile-related event communication across the application
 */
const profileEventBus = new ProfileEventBus();
export default profileEventBus;
