import { useCallback, useRef, useState } from 'react';

export interface UseNativeReelSwiperOptions<T> {
  items: T[];
  initialIndex?: number;
  onActiveItemChange?: (index: number, item: T) => void;
}

export function useNativeReelSwiper<T = any>(options: UseNativeReelSwiperOptions<T>) {
  const { items, initialIndex = 0, onActiveItemChange } = options;
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 70,
  });

  const onViewableItemsChangedRef = useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const idx = viewableItems[0].index;
      setActiveIndex(idx);
      if (onActiveItemChange && items[idx]) {
        onActiveItemChange(idx, items[idx]);
      }
    }
  });

  const getFlatListProps = useCallback(
    () => ({
      data: items,
      pagingEnabled: true,
      horizontal: false,
      showsVerticalScrollIndicator: false,
      viewabilityConfig: viewabilityConfigRef.current,
      onViewableItemsChanged: onViewableItemsChangedRef.current,
      keyExtractor: (item: any, index: number) => (item && item.id ? String(item.id) : String(index)),
    }),
    [items]
  );

  return {
    activeIndex,
    activeItem: items[activeIndex] ?? null,
    getFlatListProps,
  };
}
