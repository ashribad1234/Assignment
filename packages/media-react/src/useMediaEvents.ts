import { useEffect } from 'react';
import { EventCallback, MediaEventPayloadMap, MediaEventType, MediaItem } from 'media-core';
import { useMediaClient } from './MediaContext';

export function useMediaEventListener<K extends MediaEventType>(
  event: K,
  callback: EventCallback<K>
): void {
  const client = useMediaClient();

  useEffect(() => {
    const unsubscribe = client.on(event, callback);
    return () => {
      unsubscribe();
    };
  }, [client, event, callback]);
}

export function useMediaEventTracker() {
  const client = useMediaClient();

  return {
    trackView: (item: MediaItem) => client.trackView(item),
    trackDownload: (item: MediaItem, downloadUrl?: string) => client.trackDownload(item, downloadUrl),
  };
}
