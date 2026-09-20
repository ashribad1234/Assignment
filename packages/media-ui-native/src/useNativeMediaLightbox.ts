import { useCallback, useState } from 'react';

export interface UseNativeMediaLightboxOptions<T> {
  items: T[];
  initialIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  loop?: boolean;
}

export function useNativeMediaLightbox<T = any>(options: UseNativeMediaLightboxOptions<T>) {
  const { items, initialIndex = 0, isOpen: controlledIsOpen, onClose, loop = true } = options;

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const activeItem = items[activeIndex] ?? null;

  const openAt = useCallback((index: number) => {
    setActiveIndex(index);
    setInternalIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setInternalIsOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const next = useCallback(() => {
    if (items.length === 0) return;
    const nextIdx = activeIndex + 1 >= items.length ? (loop ? 0 : activeIndex) : activeIndex + 1;
    setActiveIndex(nextIdx);
  }, [activeIndex, items.length, loop]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    const prevIdx = activeIndex - 1 < 0 ? (loop ? items.length - 1 : activeIndex) : activeIndex - 1;
    setActiveIndex(prevIdx);
  }, [activeIndex, items.length, loop]);

  const getModalProps = useCallback(
    () => ({
      visible: isOpen,
      onRequestClose: close,
      animationType: 'fade' as const,
      transparent: true,
    }),
    [isOpen, close]
  );

  return {
    isOpen,
    activeIndex,
    activeItem,
    openAt,
    close,
    next,
    prev,
    getModalProps,
  };
}
