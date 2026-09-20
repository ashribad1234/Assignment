/**
 * Core Media SDK Type Definitions
 */

export type MediaType = 'photo' | 'video';

export interface BaseMedia {
  id: number;
  type: MediaType;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  photographerId: number;
  avgColor?: string;
}

export interface PhotoSource {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PhotoMedia extends BaseMedia {
  type: 'photo';
  alt: string;
  src: PhotoSource;
}

export interface VideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'hls' | string;
  fileType: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  link: string;
}

export interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface VideoMedia extends BaseMedia {
  type: 'video';
  duration: number;
  image: string; // poster preview image
  videoFiles: VideoFile[];
  videoPictures: VideoPicture[];
}

export type MediaItem = PhotoMedia | VideoMedia;

export interface PaginatedResult<T> {
  page: number;
  perPage: number;
  totalResults: number;
  nextPage?: string;
  prevPage?: string;
  items: T[];
}

export interface SearchOptions {
  query: string;
  type?: MediaType;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  locale?: string;
}

export interface CuratedOptions {
  page?: number;
  perPage?: number;
}

export interface MediaClientConfig {
  apiKey: string;
  baseUrl?: string;
  enableConsoleLogging?: boolean;
  cacheTtlMs?: number;
}

export interface MediaEventPayloadMap {
  view: {
    item: MediaItem;
    timestamp: number;
  };
  download: {
    item: MediaItem;
    downloadUrl: string;
    timestamp: number;
  };
}

export type MediaEventType = keyof MediaEventPayloadMap;

export type EventCallback<T extends MediaEventType> = (
  payload: MediaEventPayloadMap[T]
) => void;

export interface UnsubscribeFn {
  (): void;
}
