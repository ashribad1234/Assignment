import { MediaCache } from './cache';
import { MediaError } from './errors';
import { MediaEventEmitter } from './events';
import {
  CuratedOptions,
  EventCallback,
  MediaClientConfig,
  MediaEventType,
  MediaItem,
  PaginatedResult,
  PhotoMedia,
  PhotoSource,
  SearchOptions,
  UnsubscribeFn,
  VideoFile,
  VideoMedia,
  VideoPicture,
} from './types';

export class MediaClient {
  private apiKey: string;
  private baseUrl: string;
  private cache: MediaCache;
  private events: MediaEventEmitter;

  constructor(config: MediaClientConfig) {
    if (!config.apiKey && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('[MediaSDK] Warning: Client initialized without an API key.');
    }
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'https://api.pexels.com';
    this.cache = new MediaCache(config.cacheTtlMs);
    this.events = new MediaEventEmitter(config.enableConsoleLogging ?? true);
  }

  // --- Normalization Helpers ---

  private normalizePhoto(raw: any): PhotoMedia {
    const src: PhotoSource = {
      original: raw.src?.original || '',
      large2x: raw.src?.large2x || raw.src?.original || '',
      large: raw.src?.large || raw.src?.original || '',
      medium: raw.src?.medium || raw.src?.original || '',
      small: raw.src?.small || raw.src?.original || '',
      portrait: raw.src?.portrait || raw.src?.original || '',
      landscape: raw.src?.landscape || raw.src?.original || '',
      tiny: raw.src?.tiny || raw.src?.original || '',
    };

    return {
      id: raw.id,
      type: 'photo',
      width: raw.width || 0,
      height: raw.height || 0,
      url: raw.url || '',
      photographer: raw.photographer || 'Unknown',
      photographerUrl: raw.photographer_url || '',
      photographerId: raw.photographer_id || 0,
      avgColor: raw.avg_color,
      alt: raw.alt || raw.photographer ? `Photo by ${raw.photographer}` : 'Photo',
      src,
    };
  }

  private normalizeVideo(raw: any): VideoMedia {
    const videoFiles: VideoFile[] = (raw.video_files || []).map((vf: any) => ({
      id: vf.id,
      quality: vf.quality,
      fileType: vf.file_type,
      width: vf.width,
      height: vf.height,
      fps: vf.fps,
      link: vf.link,
    }));

    const videoPictures: VideoPicture[] = (raw.video_pictures || []).map((vp: any) => ({
      id: vp.id,
      picture: vp.picture,
      nr: vp.nr,
    }));

    // Choose best preview image
    const image = raw.image || (videoPictures.length > 0 ? videoPictures[0].picture : '');

    return {
      id: raw.id,
      type: 'video',
      width: raw.width || 0,
      height: raw.height || 0,
      url: raw.url || '',
      photographer: raw.user?.name || 'Unknown',
      photographerUrl: raw.user?.url || '',
      photographerId: raw.user?.id || 0,
      duration: raw.duration || 0,
      image,
      videoFiles,
      videoPictures,
    };
  }

  // --- HTTP Request Core ---

  private async request<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });

    const cacheKey = url.toString();

    return this.cache.getOrFetch<T>(cacheKey, async () => {
      let response: Response;
      try {
        response = await fetch(url.toString(), {
          headers: {
            Authorization: this.apiKey,
          },
        });
      } catch (err) {
        throw MediaError.network(err);
      }

      if (!response.ok) {
        let message: string | undefined;
        try {
          const errJson: any = await response.json();
          message = errJson?.error || errJson?.message;
        } catch {
          // Ignore JSON parse error on non-ok status
        }
        throw MediaError.fromHttpResponse(response.status, message);
      }

      try {
        return (await response.json()) as T;
      } catch (err) {
        throw MediaError.parse(err);
      }
    });
  }

  // --- Public SDK Methods ---

  public async searchPhotos(options: SearchOptions): Promise<PaginatedResult<PhotoMedia>> {
    const raw = await this.request<any>('/v1/search', {
      query: options.query,
      page: options.page || 1,
      per_page: options.perPage || 15,
      orientation: options.orientation,
      size: options.size,
      color: options.color,
      locale: options.locale,
    });

    return {
      page: raw.page || 1,
      perPage: raw.per_page || options.perPage || 15,
      totalResults: raw.total_results || 0,
      nextPage: raw.next_page,
      prevPage: raw.prev_page,
      items: (raw.photos || []).map((p: any) => this.normalizePhoto(p)),
    };
  }

  public async searchVideos(options: SearchOptions): Promise<PaginatedResult<VideoMedia>> {
    const raw = await this.request<any>('/videos/search', {
      query: options.query,
      page: options.page || 1,
      per_page: options.perPage || 15,
      orientation: options.orientation,
      size: options.size,
      locale: options.locale,
    });

    return {
      page: raw.page || 1,
      perPage: raw.per_page || options.perPage || 15,
      totalResults: raw.total_results || 0,
      nextPage: raw.next_page,
      prevPage: raw.prev_page,
      items: (raw.videos || []).map((v: any) => this.normalizeVideo(v)),
    };
  }

  public async searchMedia(options: SearchOptions): Promise<PaginatedResult<MediaItem>> {
    const type = options.type || 'photo';
    if (type === 'video') {
      return this.searchVideos(options);
    }
    return this.searchPhotos(options);
  }

  public async getCuratedPhotos(options: CuratedOptions = {}): Promise<PaginatedResult<PhotoMedia>> {
    const raw = await this.request<any>('/v1/curated', {
      page: options.page || 1,
      per_page: options.perPage || 15,
    });

    return {
      page: raw.page || 1,
      perPage: raw.per_page || options.perPage || 15,
      totalResults: raw.total_results || 0,
      nextPage: raw.next_page,
      prevPage: raw.prev_page,
      items: (raw.photos || []).map((p: any) => this.normalizePhoto(p)),
    };
  }

  public async getPopularVideos(options: CuratedOptions = {}): Promise<PaginatedResult<VideoMedia>> {
    const raw = await this.request<any>('/videos/popular', {
      page: options.page || 1,
      per_page: options.perPage || 15,
    });

    return {
      page: raw.page || 1,
      perPage: raw.per_page || options.perPage || 15,
      totalResults: raw.total_results || 0,
      nextPage: raw.next_page,
      prevPage: raw.prev_page,
      items: (raw.videos || []).map((v: any) => this.normalizeVideo(v)),
    };
  }

  public async getPhoto(id: number): Promise<PhotoMedia> {
    const raw = await this.request<any>(`/v1/photos/${id}`);
    return this.normalizePhoto(raw);
  }

  public async getVideo(id: number): Promise<VideoMedia> {
    const raw = await this.request<any>(`/videos/videos/${id}`);
    return this.normalizeVideo(raw);
  }

  // --- Events API ---

  public on<K extends MediaEventType>(event: K, callback: EventCallback<K>): UnsubscribeFn {
    return this.events.on(event, callback);
  }

  public off<K extends MediaEventType>(event: K, callback: EventCallback<K>): void {
    this.events.off(event, callback);
  }

  public trackView(item: MediaItem): void {
    this.events.emit('view', {
      item,
      timestamp: Date.now(),
    });
  }

  public trackDownload(item: MediaItem, downloadUrl?: string): void {
    const url = downloadUrl || (item.type === 'photo' ? item.src.original : item.videoFiles[0]?.link || item.url);
    this.events.emit('download', {
      item,
      downloadUrl: url,
      timestamp: Date.now(),
    });
  }
}

export function createMediaClient(config: MediaClientConfig): MediaClient {
  return new MediaClient(config);
}
