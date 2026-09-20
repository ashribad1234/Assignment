---
name: media-components
description: Guidance and pattern reference for consuming headless UI packages (media-ui-react and media-ui-native).
---

# Media Headless UI Component Skill

This skill guides AI agents on how to consume `media-ui-react` and `media-ui-native` headless components and hooks.

## Architecture Rules & Boundaries

1. **Strict UI Independence**:
   - `media-ui-react` and `media-ui-native` MUST NOT import `media-core`, `media-react`, or `media-native`.
   - UI packages receive data and callbacks strictly through props/hooks.
2. **Headless Philosophy**:
   - UI packages DO NOT export styled DOM nodes or opinionated CSS.
   - Behavior, keyboard navigation, focus management, and accessibility are exposed through **prop-getters**.
   - The consuming application owns 100% of the markup, class names, and CSS styling.

---

## 1. Headless Media Grid (`useMediaGrid`)

Exposes scroll sentinel infinite scroll detection and grid accessibility attributes:

```tsx
import { useMediaGrid } from 'media-ui-react';

export function CustomGrid({ items, hasMore, loading, onLoadMore }) {
  const { sentinelRef, getGridProps, getItemProps, getSentinelProps } = useMediaGrid({
    items,
    hasMore,
    loading,
    onLoadMore,
  });

  return (
    <div>
      <div className="my-custom-grid" {...getGridProps()}>
        {items.map((item, index) => (
          <div key={item.id} className="grid-cell" {...getItemProps(item, index)}>
            <img src={item.src.medium} alt={item.alt} />
          </div>
        ))}
      </div>
      
      {/* Scroll sentinel element triggers infinite loadMore automatically */}
      <div ref={sentinelRef} {...getSentinelProps()}>
        {loading && <p>Loading more items...</p>}
      </div>
    </div>
  );
}
```

---

## 2. Headless Lightbox Modal (`useMediaLightbox`)

Handles dialog state, prev/next item navigation, `Escape` key close, `ArrowLeft`/`ArrowRight` keys, focus trapping, and ARIA attributes:

```tsx
import { useMediaLightbox } from 'media-ui-react';

export function CustomLightbox({ items, isOpen, onClose }) {
  const lightbox = useMediaLightbox({
    items,
    isOpen,
    onClose,
    loop: true,
  });

  if (!lightbox.isOpen || !lightbox.activeItem) return null;

  return (
    <div className="modal-backdrop" {...lightbox.getBackdropProps()}>
      <div className="modal-dialog" {...lightbox.getDialogProps()}>
        <button {...lightbox.getCloseButtonProps()}>Close</button>
        
        <img src={lightbox.activeItem.src.large} alt={lightbox.activeItem.alt} />

        <button {...lightbox.getPrevButtonProps()}>Previous</button>
        <button {...lightbox.getNextButtonProps()}>Next</button>
      </div>
    </div>
  );
}
```

---

## 3. Headless Reel Swiper (`useReelSwiper`)

Provides vertical snap scrolling and active item detection:

```tsx
import { useReelSwiper } from 'media-ui-react';

export function CustomReelSwiper({ videos }) {
  const reels = useReelSwiper({
    items: videos,
    onActiveItemChange: (index, activeVideo) => {
      console.log('Now watching reel #', index, activeVideo.id);
    },
  });

  return (
    <div className="reel-viewport" {...reels.getContainerProps()}>
      {videos.map((video, index) => (
        <div key={video.id} className="reel-slide" {...reels.getReelItemProps(video, index)}>
          <video src={video.videoFiles[0]?.link} controls loop />
        </div>
      ))}
    </div>
  );
}
```
