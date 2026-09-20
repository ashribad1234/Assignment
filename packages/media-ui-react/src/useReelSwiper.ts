import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseReelSwiperOptions<T> {
  items: T[];
  initialIndex?: number;
  onActiveItemChange?: (index: number, item: T) => void;
  threshold?: number;
}

export interface UseReelSwiperResult<T> {
  activeIndex: number;
  activeItem: T | null;
  scrollToIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  getContainerProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
  getReelItemProps: (item: T, index: number, userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
}

export function useReelSwiper<T = any>(options: UseReelSwiperOptions<T>): UseReelSwiperResult<T> {
  const { items, initialIndex = 0, onActiveItemChange, threshold = 0.6 } = options;

  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  const activeItem = items[activeIndex] ?? null;

  const scrollToIndex = useCallback((index: number) => {
    const el = itemRefs.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-reel-index');
            if (indexAttr !== null) {
              const idx = parseInt(indexAttr, 10);
              if (!isNaN(idx)) {
                setActiveIndex(idx);
                if (onActiveItemChange && items[idx]) {
                  onActiveItemChange(idx, items[idx]);
                }
              }
            }
          }
        });
      },
      {
        root: container,
        threshold,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [items, onActiveItemChange, threshold]);

  const getContainerProps = useCallback(
    (userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      ref: containerRef as any,
      style: {
        height: '100%',
        width: '100%',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        ...userProps.style,
      },
      ...userProps,
    }),
    []
  );

  const getReelItemProps = useCallback(
    (item: T, index: number, userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      'data-reel-index': index,
      ref: (node: HTMLElement | null) => {
        if (node) {
          itemRefs.current.set(index, node);
        } else {
          itemRefs.current.delete(index);
        }
      },
      style: {
        height: '100%',
        width: '100%',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        position: 'relative',
        ...userProps.style,
      },
      ...userProps,
    }),
    []
  );

  return {
    activeIndex,
    activeItem,
    scrollToIndex,
    containerRef,
    getContainerProps,
    getReelItemProps,
  };
}
