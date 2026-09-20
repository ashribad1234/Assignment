import {
  EventCallback,
  MediaEventPayloadMap,
  MediaEventType,
  UnsubscribeFn,
} from './types';

export class MediaEventEmitter {
  private listeners: {
    [K in MediaEventType]?: Set<EventCallback<K>>;
  } = {};

  constructor(enableConsoleLogging = true) {
    if (enableConsoleLogging) {
      this.on('view', (payload) => {
        console.log(`[MediaSDK Event] View item #${payload.item.id} (${payload.item.type}) at ${new Date(payload.timestamp).toISOString()}`);
      });
      this.on('download', (payload) => {
        console.log(`[MediaSDK Event] Download item #${payload.item.id} from ${payload.downloadUrl}`);
      });
    }
  }

  public on<K extends MediaEventType>(
    event: K,
    callback: EventCallback<K>
  ): UnsubscribeFn {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as any;
    }
    const set = this.listeners[event] as Set<EventCallback<K>>;
    set.add(callback);

    return () => {
      set.delete(callback);
    };
  }

  public off<K extends MediaEventType>(
    event: K,
    callback: EventCallback<K>
  ): void {
    const set = this.listeners[event] as Set<EventCallback<K>> | undefined;
    if (set) {
      set.delete(callback);
    }
  }

  public emit<K extends MediaEventType>(
    event: K,
    payload: MediaEventPayloadMap[K]
  ): void {
    const set = this.listeners[event] as Set<EventCallback<K>> | undefined;
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[MediaSDK Event Error] Handler for ${event} threw:`, err);
        }
      });
    }
  }
}
