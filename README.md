# Headless Media SDK Ecosystem

A modular, framework-agnostic headless media SDK monorepo built with TypeScript, React, and React Native (headless), integrating the Pexels API.

---

## 🏗️ Architecture & Dependency Direction

The monorepo strictly enforces clear package boundaries and single-direction dependency flow:

```
                    apps/web
                   /        \
                  v          v
         media-react     media-ui-react
              |                 |
              v                 v
         media-core        (Independent)

    ----------------------------------------

               (React Native App)
                  /        \
                 v          v
        media-native     media-ui-native
             |                  |
             v                  v
        media-core         (Independent)
```

### Architectural Rules
1. **`media-core`**:
   - Zero framework or DOM dependencies (no React, React Native, `window`, or UI packages).
   - Responsible for Pexels API fetching, response normalization, in-memory caching/deduplication, custom `MediaError` classification, and strongly-typed event dispatching (`view` & `download`).
2. **`media-react` & `media-native`**:
   - Platform adaptation layers only.
   - Wraps `media-core` using React context (`MediaProvider`) and custom hooks (`useMediaSearch`, `useMediaItem`, `useMediaEvents`).
   - Does NOT duplicate business logic, caching, or fetching logic.
3. **`media-ui-react` & `media-ui-native`**:
   - Strictly independent of `media-core`, `media-react`, and `media-native`.
   - Headless behavior, state, keyboard navigation, focus management, and accessibility prop-getters.
   - Zero opinionated styling or DOM markup structure—the consumer retains 100% control of styling.
4. **`apps/web`**:
   - React + TypeScript demo web application that connects `media-react` (for data/events) and `media-ui-react` (for headless UI behaviors).
   - Never calls Pexels API directly from application components.

---

## 📁 Repository Structure

```
├── packages/
│   ├── media-core/          # Pure TypeScript Pexels SDK client & event emitter
│   ├── media-react/         # React hooks & MediaProvider adapter
│   ├── media-native/        # React Native hooks & NativeMediaProvider adapter
│   ├── media-ui-react/      # Headless React UI hooks (Grid, Lightbox, Reel Swiper)
│   └── media-ui-native/     # Headless React Native UI hooks (Grid, Lightbox, Reel Swiper)
│
├── apps/
│   └── web/                 # Vite + React + TS demo web application
│
├── skills/
│   ├── media-data/
│   │   └── SKILL.md         # AI Agent skill for SDK setup, data fetching & events
│   └── media-components/
│       └── SKILL.md         # AI Agent skill for headless UI prop-getters & components
│
├── package.json             # Monorepo workspace configuration
├── tsconfig.base.json       # Base strict TypeScript config
└── README.md                # Project documentation
```

---

## ⚡ Quick Start & Development Commands

### Prerequisites
- **Node.js**: `v18.0.0` or later
- **npm**: `v9.0.0` or later

### 1. Installation
Install all monorepo workspace dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create an `.env` file in `apps/web`:
```bash
cp apps/web/.env.example apps/web/.env
```
Add your Pexels API key:
```env
VITE_PEXELS_API_KEY=your_actual_pexels_api_key
```

### 3. Type Checking & Building
Check TypeScript across all packages:
```bash
npm run typecheck
```

Build all packages:
```bash
npm run build
```

### 4. Run Web Demo Application
Launch the Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📦 Package Summaries & Usage Examples

### 1. `media-core`

```typescript
import { createMediaClient } from 'media-core';

const client = createMediaClient({
  apiKey: 'YOUR_PEXELS_API_KEY',
  enableConsoleLogging: true,
});

// Photo Search
const photos = await client.searchPhotos({ query: 'nature', page: 1, perPage: 10 });

// Video Search
const videos = await client.searchVideos({ query: 'ocean', page: 1, perPage: 5 });

// Event Subscriptions
const unsubscribe = client.on('view', (payload) => {
  console.log('Item viewed:', payload.item.id);
});

// Event Tracking
client.trackView(photos.items[0]);
client.trackDownload(photos.items[0]);
```

---

### 2. `media-react`

```tsx
import { MediaProvider, useMediaSearch, useMediaEventTracker } from 'media-react';

function PhotoGallery() {
  const { items, loading, hasMore, loadMore } = useMediaSearch({
    query: 'mountains',
    type: 'photo',
  });
  const { trackView } = useMediaEventTracker();

  return (
    <div>
      {items.map((item) => (
        <img
          key={item.id}
          src={(item as PhotoMedia).src.medium}
          onClick={() => trackView(item)}
        />
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

---

### 3. `media-ui-react` (Headless UI)

```tsx
import { useMediaGrid, useMediaLightbox, useReelSwiper } from 'media-ui-react';

// Headless Grid Example
const { sentinelRef, getGridProps, getItemProps } = useMediaGrid({
  items,
  hasMore,
  loading,
  onLoadMore: loadMore,
});

// Headless Lightbox Example
const lightbox = useMediaLightbox({
  items,
  isOpen,
  onClose: () => setIsOpen(false),
});

// Headless Reel Swiper Example
const reels = useReelSwiper({
  items: videos,
  onActiveItemChange: (index, video) => console.log('Active video:', video.id),
});
```

---

## 🎯 Architecture Decisions, Assumptions & Trade-offs

1. **Monorepo Management**: Uses npm native workspaces (`workspaces: ["packages/*", "apps/*"]`) for zero-external-tooling setup and maximum reliability across Windows/Linux/macOS platforms.
2. **Headless UI Contract**: All UI hooks expose semantic **prop-getters** (`getGridProps`, `getDialogProps`, `getBackdropProps`, `getReelItemProps`). This ensures standard ARIA attributes (`role="dialog"`, `aria-modal="true"`) and event handlers are applied seamlessly while leaving 100% of HTML/CSS markup to the consumer.
3. **In-Memory Caching & Request Deduplication**: Implemented in `media-core` via `MediaCache` to avoid duplicate in-flight network requests for identical queries and pages.
4. **React Native Headless Packages**: `media-native` and `media-ui-native` are authored with strict peer dependencies (`react` and `@types/react-native`). This enables easy usage in Expo or bare React Native applications without dragging native build tools into the web monorepo workspace.
5. **Intentionally Omitted Features**:
   - *Heavy UI component styling libraries (Tailwind/Emotion)*: Omitted by design to strictly adhere to the headless architecture requirement.
   - *Global Redux/Zustand state*: Omitted in favor of clean React Context and pure hooks.

---

## 🤖 AI-Assisted Development & SKILL.md Files

This project includes two specialized AI Skill instruction files located in the `skills/` directory:

1. **`skills/media-data/SKILL.md`**:
   - Teaches AI agents how to configure `MediaProvider`, manage API keys, consume `useMediaSearch` pagination, handle error kinds (`MediaError`), and subscribe to SDK events (`view` and `download`).
2. **`skills/media-components/SKILL.md`**:
   - Teaches AI agents how to build custom UI components using `media-ui-react` headless hooks (`useMediaGrid`, `useMediaLightbox`, `useReelSwiper`), applying prop-getters and accessibility attributes while preserving total control over styling.
