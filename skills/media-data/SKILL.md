---
name: media-data
description: Guidance and pattern reference for working with media-core and media-react SDK data layers.
---

# Media Data SDK Integration Skill

This skill guides AI agents on how to correctly configure and consume `media-core` and `media-react` (or `media-native`).

## Architecture Rules & Boundaries

1. **`media-core` Dependency Isolation**:
   - `media-core` MUST NOT import React, React Native, DOM APIs, or any UI package.
   - It is a pure, framework-agnostic TypeScript client for Pexels API normalization, caching, and event dispatch.
2. **Framework Adapters (`media-react`, `media-native`)**:
   - Contain ONLY state management and hook adapters (`MediaProvider`, `useMediaSearch`, `useMediaItem`, `useMediaEvents`).
   - MUST NOT duplicate business logic, caching algorithms, or API fetching logic from `media-core`.
3. **Application Layer (`apps/web`)**:
   - MUST NOT call Pexels API directly.
   - MUST consume data exclusively via `media-react` / `media-core`.

---

## 1. Provider & Client Setup

Initialize `MediaClient` and wrap your React application tree with `<MediaProvider>`:

```tsx
import { createMediaClient } from 'media-core';
import { MediaProvider } from 'media-react';

const client = createMediaClient({
  apiKey: process.env.VITE_PEXELS_API_KEY || '',
  enableConsoleLogging: true,
  cacheTtlMs: 1000 * 60 * 5, // 5 min cache
});

export function App() {
  return (
    <MediaProvider client={client}>
      <YourAppComponents />
    </MediaProvider>
  );
}
```

---

## 2. Searching & Pagination (`useMediaSearch`)

Use `useMediaSearch` to fetch photos or videos with full pagination and state tracking:

```tsx
import { useMediaSearch } from 'media-react';

export function PhotoSearchComponent() {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    search,
  } = useMediaSearch({
    query: 'architecture',
    type: 'photo',
    perPage: 12,
    autoFetch: true,
  });

  if (error) {
    return <div>Error ({error.kind}): {error.message}</div>;
  }

  return (
    <div>
      <button onClick={() => search('mountains', 'photo')}>Search Mountains</button>
      
      {items.map((item) => (
        <img key={item.id} src={(item as PhotoMedia).src.medium} alt={item.photographer} />
      ))}

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## 3. Event Subscriptions (`view` and `download`)

`media-core` includes a strongly-typed event emitter. Track or subscribe to media interactions cleanly:

```tsx
import { useMediaEventListener, useMediaEventTracker } from 'media-react';

export function MediaTrackerExample() {
  const { trackView, trackDownload } = useMediaEventTracker();

  // Subscribe to 'view' events emitted anywhere in the SDK
  useMediaEventListener('view', (payload) => {
    console.log('Media Item Viewed:', payload.item.id, 'at', payload.timestamp);
  });

  // Subscribe to 'download' events
  useMediaEventListener('download', (payload) => {
    console.log('Media Item Downloaded:', payload.downloadUrl);
  });

  return (
    <button onClick={() => trackDownload(item, item.src.original)}>
      Track Download
    </button>
  );
}
```
