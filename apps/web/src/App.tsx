import React, { useState } from 'react';
import { createMediaClient, MediaItem, PhotoMedia, VideoMedia } from 'media-core';
import { MediaProvider, useMediaEventTracker, useMediaSearch } from 'media-react';
import { useMediaGrid, useMediaLightbox, useReelSwiper } from 'media-ui-react';
import { DocsView } from './DocsView';

const apiKey = import.meta.env.VITE_PEXELS_API_KEY || '';
const client = createMediaClient({ apiKey, enableConsoleLogging: true });

function DemoContent() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [queryInput, setQueryInput] = useState('nature');

  const { trackView, trackDownload } = useMediaEventTracker();

  // Search photos & videos via media-react hook
  const {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    search,
  } = useMediaSearch({
    query: queryInput,
    type: activeTab === 'photos' ? 'photo' : 'video',
    perPage: 12,
  });

  // Headless Grid behavior via media-ui-react hook
  const { sentinelRef, getGridProps, getItemProps, getSentinelProps } = useMediaGrid({
    items,
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  // Headless Lightbox behavior via media-ui-react hook
  const lightbox = useMediaLightbox<MediaItem>({
    items,
    onIndexChange: (_: number, item: MediaItem) => {
      if (item) trackView(item);
    },
  });

  // Headless Reel Swiper behavior via media-ui-react hook
  const reels = useReelSwiper<MediaItem>({
    items,
    onActiveItemChange: (_: number, item: MediaItem) => {
      if (item) trackView(item);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      search(queryInput, activeTab === 'photos' ? 'photo' : 'video');
    }
  };

  const handleTabChange = (newTab: 'photos' | 'videos') => {
    setActiveTab(newTab);
    search(queryInput, newTab === 'photos' ? 'photo' : 'video');
  };

  return (
    <div>
      <header className="app-header">
        <div className="header-content">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search photos or videos..."
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => handleTabChange('photos')}
            >
              Photo Grid
            </button>
            <button
              className={`mode-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => handleTabChange('videos')}
            >
              Video Reels
            </button>
          </div>
        </div>
      </header>

      {!apiKey && (
        <div className="notice-banner">
          ⚠️ <strong>Pexels API Key missing</strong>. Add <code>VITE_PEXELS_API_KEY</code> to <code>apps/web/.env</code> to load live Pexels data.
        </div>
      )}

      <main className="main-content">
        {error && (
          <div className="error-card">
            <strong>Error ({error.kind}):</strong> {error.message}
            {error.statusCode === 401 && ' (Check your VITE_PEXELS_API_KEY in apps/web/.env)'}
          </div>
        )}

        {activeTab === 'photos' ? (
          <div>
            <div className="media-grid" {...getGridProps()}>
              {items
                .filter((item: MediaItem) => item.type === 'photo')
                .map((item: MediaItem, idx: number) => {
                  const photo = item as PhotoMedia;
                  return (
                    <div
                      key={photo.id}
                      className="grid-card"
                      {...getItemProps(item, idx, {
                        onClick: () => {
                          trackView(photo);
                          lightbox.openAt(idx);
                        },
                      })}
                    >
                      <img src={photo.src?.medium || photo.src?.original} alt={photo.alt} loading="lazy" />
                      <div className="card-overlay">
                        <span className="card-photographer">{photo.photographer}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div ref={sentinelRef} className="loader-sentinel" {...getSentinelProps()}>
              {loading && 'Loading more photos...'}
              {!loading && !hasMore && items.length > 0 && 'End of media results.'}
            </div>
          </div>
        ) : (
          <div className="reels-wrapper">
            <div {...reels.getContainerProps()}>
              {items
                .filter((item: MediaItem) => item.type === 'video')
                .map((item: MediaItem, idx: number) => {
                  const video = item as VideoMedia;
                  const src = video.videoFiles?.[0]?.link;
                  return (
                    <div key={video.id} className="reel-card" {...reels.getReelItemProps(item, idx)}>
                      {src ? (
                        <video src={src} poster={video.image} controls loop muted playsInline />
                      ) : (
                        <img src={video.image} alt="Video preview" />
                      )}
                      <div className="reel-info-overlay">
                        <span className="reel-badge">Reel #{idx + 1}</span>
                        <span className="reel-author">📹 {video.photographer}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Headless Lightbox Modal controlled via media-ui-react */}
      {lightbox.isOpen && lightbox.activeItem && (
        <div className="lightbox-backdrop" {...lightbox.getBackdropProps()}>
          <div className="lightbox-dialog" {...lightbox.getDialogProps()}>
            <button className="lightbox-close-btn" {...lightbox.getCloseButtonProps()}>
              ✕
            </button>

            <div className="lightbox-body">
              {lightbox.activeItem.type === 'photo' ? (
                <img
                  src={(lightbox.activeItem as PhotoMedia).src.large2x}
                  alt={(lightbox.activeItem as PhotoMedia).alt}
                />
              ) : (
                <video
                  src={(lightbox.activeItem as VideoMedia).videoFiles?.[0]?.link}
                  controls
                  autoPlay
                />
              )}

              <div className="lightbox-controls">
                <button className="lightbox-nav-btn" {...lightbox.getPrevButtonProps()}>
                  ‹
                </button>
                <button className="lightbox-nav-btn" {...lightbox.getNextButtonProps()}>
                  ›
                </button>
              </div>
            </div>

            <div className="lightbox-footer">
              <div className="lightbox-info">
                <h3>{lightbox.activeItem.photographer}</h3>
                <p>
                  Dimensions: {lightbox.activeItem.width} × {lightbox.activeItem.height} • Type:{' '}
                  {lightbox.activeItem.type}
                </p>
              </div>
              <button
                className="download-btn"
                onClick={() => {
                  if (lightbox.activeItem) {
                    trackDownload(lightbox.activeItem);
                    const url =
                      lightbox.activeItem.type === 'photo'
                        ? (lightbox.activeItem as PhotoMedia).src.original
                        : (lightbox.activeItem as VideoMedia).videoFiles?.[0]?.link;
                    if (url) window.open(url, '_blank');
                  }
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function App() {
  const [viewMode, setViewMode] = useState<'demo' | 'docs'>('demo');

  return (
    <MediaProvider client={client}>
      <div className="app-root">
        <nav className="top-nav">
          <div className="top-nav-content">
            <div className="logo-group">
              <span className="logo-badge">SDK</span>
              <span className="logo-title">Headless Media Ecosystem</span>
            </div>
            <div className="view-switcher">
              <button
                className={`nav-tab ${viewMode === 'demo' ? 'active' : ''}`}
                onClick={() => setViewMode('demo')}
              >
                🚀 Live App Demo
              </button>
              <button
                className={`nav-tab ${viewMode === 'docs' ? 'active' : ''}`}
                onClick={() => setViewMode('docs')}
              >
                📖 Deployable Docs
              </button>
            </div>
          </div>
        </nav>

        {viewMode === 'demo' ? <DemoContent /> : <DocsView />}
      </div>
    </MediaProvider>
  );
}

export default App;
