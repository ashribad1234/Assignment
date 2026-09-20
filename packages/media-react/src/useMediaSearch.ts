import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaError, MediaItem, MediaType, SearchOptions } from 'media-core';
import { useMediaClient } from './MediaContext';

export interface UseMediaSearchOptions {
  query?: string;
  type?: MediaType;
  perPage?: number;
  autoFetch?: boolean;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
}

export interface UseMediaSearchResult {
  items: MediaItem[];
  loading: boolean;
  loadingMore: boolean;
  error: MediaError | null;
  page: number;
  hasMore: boolean;
  totalResults: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (newQuery: string, newType?: MediaType) => Promise<void>;
}

export function useMediaSearch(options: UseMediaSearchOptions = {}): UseMediaSearchResult {
  const client = useMediaClient();
  const { query = 'nature', type = 'photo', perPage = 15, autoFetch = true, orientation, size } = options;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<MediaError | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalResults, setTotalResults] = useState<number>(0);

  const activeQueryRef = useRef(query);
  const activeTypeRef = useRef(type);
  activeQueryRef.current = query;
  activeTypeRef.current = type;

  const fetchItems = useCallback(
    async (targetPage: number, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
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
          orientation,
          size,
        };

        const result = await client.searchMedia(searchOpts);

        setItems((prev) => (isLoadMore ? [...prev, ...result.items] : result.items));
        setPage(result.page);
        setTotalResults(result.totalResults);
        setHasMore(!!result.nextPage && (isLoadMore ? items.length + result.items.length : result.items.length) < result.totalResults);
      } catch (err) {
        const mediaErr = err instanceof MediaError ? err : MediaError.network(err);
        setError(mediaErr);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [client, perPage, orientation, size, items.length]
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

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchItems(1, false);
  }, [fetchItems]);

  useEffect(() => {
    if (autoFetch) {
      fetchItems(1, false);
    }
  }, [query, type, autoFetch]); // Reset when query or type changes

  return {
    items,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    totalResults,
    loadMore,
    refresh,
    search,
  };
}
