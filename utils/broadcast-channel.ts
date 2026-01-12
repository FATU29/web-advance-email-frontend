/**
 * BroadcastChannel utility for cross-tab communication
 * Used for synchronizing logout and auth state across multiple tabs
 */

const AUTH_CHANNEL_NAME = 'awad-email-auth';

export type AuthBroadcastMessage =
  | { type: 'LOGOUT'; timestamp: number }
  | { type: 'LOGIN'; userId: string; timestamp: number };

class AuthBroadcastChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, (message: AuthBroadcastMessage) => void> =
    new Map();

  constructor() {
    // Only create BroadcastChannel if it's supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        this.channel.onmessage = (
          event: MessageEvent<AuthBroadcastMessage>
        ) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        console.warn(
          'BroadcastChannel not supported or failed to create:',
          error
        );
      }
    } else {
      console.warn('BroadcastChannel API not supported in this browser');
    }
  }

  /**
   * Broadcast logout event to all tabs
   */
  broadcastLogout(): void {
    if (!this.channel) return;

    const message: AuthBroadcastMessage = {
      type: 'LOGOUT',
      timestamp: Date.now(),
    };

    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Failed to broadcast logout:', error);
    }
  }

  /**
   * Broadcast login event to all tabs
   */
  broadcastLogin(userId: string): void {
    if (!this.channel) return;

    const message: AuthBroadcastMessage = {
      type: 'LOGIN',
      userId,
      timestamp: Date.now(),
    };

    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Failed to broadcast login:', error);
    }
  }

  /**
   * Subscribe to auth events
   */
  onMessage(
    listenerId: string,
    callback: (message: AuthBroadcastMessage) => void
  ): void {
    this.listeners.set(listenerId, callback);
  }

  /**
   * Unsubscribe from auth events
   */
  offMessage(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: AuthBroadcastMessage): void {
    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in broadcast message listener:', error);
      }
    });
  }

  /**
   * Close the channel
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let broadcastChannelInstance: AuthBroadcastChannel | null = null;

/**
 * Get the singleton BroadcastChannel instance
 */
export const getAuthBroadcastChannel = (): AuthBroadcastChannel => {
  if (!broadcastChannelInstance) {
    broadcastChannelInstance = new AuthBroadcastChannel();
  }
  return broadcastChannelInstance;
};

/**
 * Cleanup function (useful for testing or cleanup)
 */
export const cleanupAuthBroadcastChannel = (): void => {
  if (broadcastChannelInstance) {
    broadcastChannelInstance.close();
    broadcastChannelInstance = null;
  }
};
