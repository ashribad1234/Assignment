import { useCallback } from 'react';

export interface UseNativeMediaGridOptions<T> {
  items: T[];
  numColumns?: number;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  onEndReachedThreshold?: number;
}

export function useNativeMediaGrid<T = any>(options: UseNativeMediaGridOptions<T>) {
  const {
    items,
    numColumns = 2,
    hasMore = false,
    loading = false,
    onLoadMore,
    onEndReachedThreshold = 0.5,
  } = options;

  const getFlatListProps = useCallback(
    () => ({
      data: items,
      numColumns,
      onEndReached: () => {
        if (hasMore && !loading && onLoadMore) {
          onLoadMore();
        }
      },
      onEndReachedThreshold,
      keyExtractor: (item: any, index: number) => (item && item.id ? String(item.id) : String(index)),
    }),
    [items, numColumns, hasMore, loading, onLoadMore, onEndReachedThreshold]
  );

  return {
    getFlatListProps,
  };
}
