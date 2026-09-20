import { useCallback, useEffect, useRef } from 'react';

export interface UseMediaGridOptions<T> {
  items: T[];
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  rootMargin?: string;
}

export interface UseMediaGridResult<T> {
  sentinelRef: (node: HTMLElement | null) => void;
  getGridProps: (userProps?: React.HTMLAttributes<HTMLElement>) => React.HTMLAttributes<HTMLElement>;
  getItemProps: (item: T, index: number, userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
  getSentinelProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
}

export function useMediaGrid<T = any>(options: UseMediaGridOptions<T>): UseMediaGridResult<T> {
  const { items, hasMore = false, loading = false, onLoadMore, rootMargin = '200px' } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !onLoadMore || !hasMore || loading) {
        return;
      }

      if (typeof IntersectionObserver !== 'undefined') {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
              onLoadMore();
            }
          },
          { rootMargin }
        );
        observerRef.current.observe(node);
      }
    },
    [hasMore, loading, onLoadMore, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const getGridProps = useCallback(
    (userProps: React.HTMLAttributes<HTMLElement> = {}): React.HTMLAttributes<HTMLElement> => ({
      role: 'grid',
      'aria-busy': loading,
      ...userProps,
    }),
    [loading]
  );

  const getItemProps = useCallback(
    (item: T, index: number, userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      role: 'gridcell',
      'data-grid-index': index,
      tabIndex: 0,
      ...userProps,
    }),
    []
  );

  const getSentinelProps = useCallback(
    (userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      'aria-hidden': true,
      style: { height: '1px', width: '100%', ...userProps.style },
      ...userProps,
    }),
    []
  );

  return {
    sentinelRef,
    getGridProps,
    getItemProps,
    getSentinelProps,
  };
}
