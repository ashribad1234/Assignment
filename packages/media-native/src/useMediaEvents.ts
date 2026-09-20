import { useEffect } from 'react';
import { EventCallback, MediaEventType, MediaItem } from 'media-core';
import { useNativeMediaClient } from './MediaProvider';

export function useNativeMediaEventListener<K extends MediaEventType>(
  event: K,
  callback: EventCallback<K>
): void {
  const client = useNativeMediaClient();

  useEffect(() => {
    const unsubscribe = client.on(event, callback);
    return () => {
      unsubscribe();
    };
  }, [client, event, callback]);
}

export function useNativeMediaEventTracker() {
  const client = useNativeMediaClient();

  return {
    trackView: (item: MediaItem) => client.trackView(item),
    trackDownload: (item: MediaItem, downloadUrl?: string) => client.trackDownload(item, downloadUrl),
  };
}
