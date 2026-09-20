import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaError, MediaItem, MediaType, SearchOptions } from 'media-core';
import { useNativeMediaClient } from './MediaProvider';

export interface UseNativeMediaSearchOptions {
  query?: string;
  type?: MediaType;
  perPage?: number;
  autoFetch?: boolean;
}

export function useNativeMediaSearch(options: UseNativeMediaSearchOptions = {}) {
  const client = useNativeMediaClient();
  const { query = 'nature', type = 'photo', perPage = 15, autoFetch = true } = options;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<MediaError | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const activeQueryRef = useRef(query);
  const activeTypeRef = useRef(type);
  activeQueryRef.current = query;
  activeTypeRef.current = type;

  const fetchItems = useCallback(
    async (targetPage: number, isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setItems([]);
      }
      setError(null);

      try {
        const searchOpts: SearchOptions = {
          query: activeQueryRef.current,
          type: activeTypeRef.current,
          page: targetPage,
          perPage,
        };

        const result = await client.searchMedia(searchOpts);
        setItems((prev) => (isLoadMore ? [...prev, ...result.items] : result.items));
        setPage(result.page);
        setHasMore(!!result.nextPage);
      } catch (err) {
        setError(err instanceof MediaError ? err : MediaError.network(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [client, perPage]
  );

  const search = useCallback(
    async (newQuery: string, newType?: MediaType) => {
      activeQueryRef.current = newQuery;
      if (newType) activeTypeRef.current = newType;
      setPage(1);
      await fetchItems(1, false);
    },
    [fetchItems]
  );

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    await fetchItems(page + 1, true);
  }, [fetchItems, loading, loadingMore, hasMore, page]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems(1, false);
    }
  }, [query, type, autoFetch]);

  return {
    items,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    loadMore,
    search,
  };
}
