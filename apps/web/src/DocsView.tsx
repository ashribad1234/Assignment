import React, { useState } from 'react';

export function DocsView() {
  const [activeDocSection, setActiveDocSection] = useState<'architecture' | 'core' | 'react' | 'ui-react' | 'ui-native' | 'skills'>('architecture');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="docs-container">
      <aside className="docs-sidebar">
        <h3 className="docs-sidebar-title">Documentation</h3>
        <nav className="docs-nav">
          <button
            className={`docs-nav-link ${activeDocSection === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('architecture')}
          >
            🏛️ Architecture & Rules
          </button>
          <button
            className={`docs-nav-link ${activeDocSection === 'core' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('core')}
          >
            📦 media-core (Core SDK)
          </button>
          <button
            className={`docs-nav-link ${activeDocSection === 'react' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('react')}
          >
            ⚛️ media-react & media-native
          </button>
          <button
            className={`docs-nav-link ${activeDocSection === 'ui-react' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('ui-react')}
          >
            🎨 media-ui-react (Headless Web)
          </button>
          <button
            className={`docs-nav-link ${activeDocSection === 'ui-native' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('ui-native')}
          >
            📱 media-ui-native (Headless Native)
          </button>
          <button
            className={`docs-nav-link ${activeDocSection === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveDocSection('skills')}
          >
            🤖 AI Agent Skills
          </button>
        </nav>
      </aside>

      <main className="docs-content">
        {activeDocSection === 'architecture' && (
          <section className="docs-section">
            <h2 className="docs-h2">Architectural Rules & Package Hierarchy</h2>
            <p className="docs-lead">
              The SDK ecosystem strictly separates data/business logic from UI presentation layers.
            </p>

            <div className="docs-card">
              <h3>Dependency Direction Diagram</h3>
              <pre className="code-block">
{`                    apps/web
                   /        \\
                  v          v
         media-react     media-ui-react
              |                 |
              v                 v
         media-core        (Independent)

    ----------------------------------------

               (React Native App)
                  /        \\
                 v          v
        media-native     media-ui-native
             |                  |
             v                  v
        media-core         (Independent)`}
              </pre>
            </div>

            <h3 className="docs-h3">Package Boundary Rules</h3>
            <ul className="docs-list">
              <li>
                <strong>media-core</strong>: Must NEVER import React, React Native, DOM APIs, or UI packages. Pure TypeScript client.
              </li>
              <li>
                <strong>media-react & media-native</strong>: Adapt media-core to platform hooks and React Context. Must NOT contain custom business/API logic.
              </li>
              <li>
                <strong>media-ui-react & media-ui-native</strong>: 100% headless behavior, state management, and accessibility prop-getters. Must NEVER import media-core or wrapper packages.
              </li>
            </ul>
          </section>
        )}

        {activeDocSection === 'core' && (
          <section className="docs-section">
            <h2 className="docs-h2">media-core API Documentation</h2>
            <p className="docs-lead">Framework-agnostic media SDK client for Pexels API normalization, caching, and event dispatching.</p>

            <h3 className="docs-h3">Client Initialization</h3>
            <div className="code-wrapper">
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(
                    `import { createMediaClient } from 'media-core';\n\nconst client = createMediaClient({\n  apiKey: 'YOUR_PEXELS_API_KEY',\n  enableConsoleLogging: true,\n  cacheTtlMs: 300000,\n});`,
                    'core-init'
                  )
                }
              >
                {copiedSnippet === 'core-init' ? 'Copied!' : 'Copy'}
              </button>
              <pre className="code-block">
{`import { createMediaClient } from 'media-core';

const client = createMediaClient({
  apiKey: 'YOUR_PEXELS_API_KEY',
  enableConsoleLogging: true,
  cacheTtlMs: 300000,
});`}
              </pre>
            </div>

            <h3 className="docs-h3">SDK Methods Reference</h3>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Method Signature</th>
                  <th>Return Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>searchPhotos(options)</code></td>
                  <td><code>Promise&lt;PaginatedResult&lt;PhotoMedia&gt;&gt;</code></td>
                  <td>Searches Pexels photo catalog with pagination & filters.</td>
                </tr>
                <tr>
                  <td><code>searchVideos(options)</code></td>
                  <td><code>Promise&lt;PaginatedResult&lt;VideoMedia&gt;&gt;</code></td>
                  <td>Searches Pexels video catalog with pagination.</td>
                </tr>
                <tr>
                  <td><code>searchMedia(options)</code></td>
                  <td><code>Promise&lt;PaginatedResult&lt;MediaItem&gt;&gt;</code></td>
                  <td>Unified search method delegating to photo or video API.</td>
                </tr>
                <tr>
                  <td><code>on(event, callback)</code></td>
                  <td><code>UnsubscribeFn</code></td>
                  <td>Subscribes to <code>view</code> or <code>download</code> SDK events.</td>
                </tr>
                <tr>
                  <td><code>trackView(item)</code></td>
                  <td><code>void</code></td>
                  <td>Emits a <code>view</code> analytics event for the specified item.</td>
                </tr>
                <tr>
                  <td><code>trackDownload(item, url)</code></td>
                  <td><code>void</code></td>
                  <td>Emits a <code>download</code> analytics event for the item.</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {activeDocSection === 'react' && (
          <section className="docs-section">
            <h2 className="docs-h2">media-react & media-native Documentation</h2>
            <p className="docs-lead">React and React Native provider and custom hooks wrapping media-core.</p>

            <h3 className="docs-h3">MediaProvider Setup</h3>
            <div className="code-wrapper">
              <button
                className="copy-btn"
                onClick={() =>
                  copyToClipboard(
                    `import { MediaProvider } from 'media-react';\nimport { client } from './mediaClient';\n\nexport function App() {\n  return (\n    <MediaProvider client={client}>\n      <MainContent />\n    </MediaProvider>\n  );\n}`,
                    'react-provider'
                  )
                }
              >
                {copiedSnippet === 'react-provider' ? 'Copied!' : 'Copy'}
              </button>
              <pre className="code-block">
{`import { MediaProvider } from 'media-react';
import { client } from './mediaClient';

export function App() {
  return (
    <MediaProvider client={client}>
      <MainContent />
    </MediaProvider>
  );
}`}
              </pre>
            </div>

            <h3 className="docs-h3">useMediaSearch Hook Usage</h3>
            <div className="code-wrapper">
              <pre className="code-block">
{`const {
  items,
  loading,
  loadingMore,
  error,
  hasMore,
  loadMore,
  search
} = useMediaSearch({
  query: 'mountains',
  type: 'photo',
  perPage: 15,
  autoFetch: true,
});`}
              </pre>
            </div>
          </section>
        )}

        {activeDocSection === 'ui-react' && (
          <section className="docs-section">
            <h2 className="docs-h2">media-ui-react Headless Components</h2>
            <p className="docs-lead">Unstyled React UI hooks providing prop-getters and accessibility features.</p>

            <h3 className="docs-h3">1. useMediaGrid Hook</h3>
            <div className="code-wrapper">
              <pre className="code-block">
{`const { sentinelRef, getGridProps, getItemProps, getSentinelProps } = useMediaGrid({
  items,
  hasMore,
  loading,
  onLoadMore: loadMore,
});

return (
  <div {...getGridProps()}>
    {items.map((item, idx) => (
      <div key={item.id} {...getItemProps(item, idx)}>
        <img src={item.src.medium} />
      </div>
    ))}
    <div ref={sentinelRef} {...getSentinelProps()} />
  </div>
);`}
              </pre>
            </div>

            <h3 className="docs-h3">2. useMediaLightbox Hook</h3>
            <div className="code-wrapper">
              <pre className="code-block">
{`const lightbox = useMediaLightbox({
  items,
  isOpen,
  onClose: () => setIsOpen(false),
  loop: true,
});

if (!lightbox.isOpen || !lightbox.activeItem) return null;

return (
  <div {...lightbox.getBackdropProps()}>
    <div {...lightbox.getDialogProps()}>
      <button {...lightbox.getCloseButtonProps()}>Close</button>
      <img src={lightbox.activeItem.src.large} />
      <button {...lightbox.getPrevButtonProps()}>Prev</button>
      <button {...lightbox.getNextButtonProps()}>Next</button>
    </div>
  </div>
);`}
              </pre>
            </div>

            <h3 className="docs-h3">3. useReelSwiper Hook</h3>
            <div className="code-wrapper">
              <pre className="code-block">
{`const reels = useReelSwiper({
  items: videos,
  onActiveItemChange: (index, video) => console.log('Active video:', video.id),
});

return (
  <div {...reels.getContainerProps()}>
    {videos.map((video, idx) => (
      <div key={video.id} {...reels.getReelItemProps(video, idx)}>
        <video src={video.videoFiles[0]?.link} controls loop />
      </div>
    ))}
  </div>
);`}
              </pre>
            </div>
          </section>
        )}

        {activeDocSection === 'ui-native' && (
          <section className="docs-section">
            <h2 className="docs-h2">media-ui-native Headless React Native Hooks</h2>
            <p className="docs-lead">React Native headless behavior hooks for FlatList, Modal, and vertical snap scrolling.</p>

            <h3 className="docs-h3">Available Hooks</h3>
            <ul className="docs-list">
              <li>
                <strong>useNativeMediaGrid</strong>: Returns <code>getFlatListProps()</code> for standard multi-column grid list rendering and <code>onEndReached</code> pagination.
              </li>
              <li>
                <strong>useNativeMediaLightbox</strong>: Returns <code>getModalProps()</code> and active item state for React Native <code>Modal</code> views.
              </li>
              <li>
                <strong>useNativeReelSwiper</strong>: Returns <code>getFlatListProps()</code> configured with <code>pagingEnabled</code> and <code>viewabilityConfig</code> for vertical video reels.
              </li>
            </ul>
          </section>
        )}

        {activeDocSection === 'skills' && (
          <section className="docs-section">
            <h2 className="docs-h2">AI Agent Skill Instructions</h2>
            <p className="docs-lead">Concrete SKILL.md documentation files for AI coding assistants.</p>

            <div className="docs-card">
              <h3>skills/media-data/SKILL.md</h3>
              <p>Provides AI agents with exact patterns for initializing <code>MediaProvider</code>, handling <code>useMediaSearch</code> pagination, handling error status codes with <code>MediaError</code>, and managing <code>view</code>/<code>download</code> events.</p>
            </div>

            <div className="docs-card">
              <h3>skills/media-components/SKILL.md</h3>
              <p>Provides AI agents with prop-getter contracts for headless components (<code>useMediaGrid</code>, <code>useMediaLightbox</code>, <code>useReelSwiper</code>) while enforcing strict UI independence.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
