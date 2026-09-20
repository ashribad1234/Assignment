import { useEffect, useState } from 'react';
import { MediaError, MediaItem, MediaType } from 'media-core';
import { useMediaClient } from './MediaContext';

export interface UseMediaItemResult {
  item: MediaItem | null;
  loading: boolean;
  error: MediaError | null;
}

export function useMediaItem(id: number | null, type: MediaType = 'photo'): UseMediaItemResult {
  const client = useMediaClient();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<MediaError | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchItem = async () => {
      try {
        const result = type === 'video' ? await client.getVideo(id) : await client.getPhoto(id);
        if (!cancelled) {
          setItem(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof MediaError ? err : MediaError.network(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [client, id, type]);

  return { item, loading, error };
}
