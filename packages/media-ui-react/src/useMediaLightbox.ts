import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMediaLightboxOptions<T> {
  items: T[];
  initialIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onIndexChange?: (index: number, item: T) => void;
  loop?: boolean;
}

export interface UseMediaLightboxResult<T> {
  isOpen: boolean;
  activeIndex: number;
  activeItem: T | null;
  hasPrev: boolean;
  hasNext: boolean;
  openAt: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  dialogRef: React.RefObject<HTMLDivElement>;
  getDialogProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
  getBackdropProps: (userProps?: React.HTMLAttributes<HTMLElement>) => Record<string, any>;
  getCloseButtonProps: (userProps?: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  getPrevButtonProps: (userProps?: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  getNextButtonProps: (userProps?: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export function useMediaLightbox<T = any>(options: UseMediaLightboxOptions<T>): UseMediaLightboxResult<T> {
  const { items, initialIndex = 0, isOpen: controlledIsOpen, onClose, onIndexChange, loop = true } = options;

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const activeItem = items[activeIndex] ?? null;

  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const hasPrev = loop ? items.length > 1 : activeIndex > 0;
  const hasNext = loop ? items.length > 1 : activeIndex < items.length - 1;

  const openAt = useCallback((index: number) => {
    if (typeof document !== 'undefined') {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    setActiveIndex(index);
    setInternalIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setInternalIsOpen(false);
    if (onClose) onClose();
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [onClose]);

  const next = useCallback(() => {
    if (items.length === 0) return;
    const nextIdx = activeIndex + 1 >= items.length ? (loop ? 0 : activeIndex) : activeIndex + 1;
    setActiveIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx, items[nextIdx]);
  }, [activeIndex, items, loop, onIndexChange]);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    const prevIdx = activeIndex - 1 < 0 ? (loop ? items.length - 1 : activeIndex) : activeIndex - 1;
    setActiveIndex(prevIdx);
    if (onIndexChange) onIndexChange(prevIdx, items[prevIdx]);
  }, [activeIndex, items, loop, onIndexChange]);

  // Focus management on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard Navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close, next, prev]);

  const getDialogProps = useCallback(
    (userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      role: 'dialog',
      'aria-modal': true,
      'aria-label': 'Media Lightbox',
      tabIndex: -1,
      ref: dialogRef as any,
      ...userProps,
    }),
    []
  );

  const getBackdropProps = useCallback(
    (userProps: React.HTMLAttributes<HTMLElement> = {}): Record<string, any> => ({
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        if (userProps.onClick) userProps.onClick(e);
        if (e.target === e.currentTarget) {
          close();
        }
      },
      ...userProps,
    }),
    [close]
  );

  const getCloseButtonProps = useCallback(
    (userProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Close Lightbox',
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (userProps.onClick) userProps.onClick(e);
        close();
      },
      ...userProps,
    }),
    [close]
  );

  const getPrevButtonProps = useCallback(
    (userProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Previous Media',
      disabled: !hasPrev,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (userProps.onClick) userProps.onClick(e);
        prev();
      },
      ...userProps,
    }),
    [hasPrev, prev]
  );

  const getNextButtonProps = useCallback(
    (userProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
      type: 'button',
      'aria-label': 'Next Media',
      disabled: !hasNext,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (userProps.onClick) userProps.onClick(e);
        next();
      },
      ...userProps,
    }),
    [hasNext, next]
  );

  return {
    isOpen,
    activeIndex,
    activeItem,
    hasPrev,
    hasNext,
    openAt,
    close,
    next,
    prev,
    dialogRef,
    getDialogProps,
    getBackdropProps,
    getCloseButtonProps,
    getPrevButtonProps,
    getNextButtonProps,
  };
}
