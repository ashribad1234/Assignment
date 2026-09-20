import React, { createContext, useContext, useMemo } from 'react';
import { createMediaClient, MediaClient, MediaClientConfig } from 'media-core';

interface MediaContextValue {
  client: MediaClient;
}

const MediaContext = createContext<MediaContextValue | null>(null);

export interface MediaProviderProps {
  client?: MediaClient;
  config?: MediaClientConfig;
  children: React.ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ client: propClient, config, children }) => {
  const client = useMemo(() => {
    if (propClient) return propClient;
    if (config) return createMediaClient(config);
    throw new Error('[MediaProvider] Must provide either a `client` instance or a `config` object.');
  }, [propClient, config]);

  const value = useMemo(() => ({ client }), [client]);

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
};

export function useMediaClient(): MediaClient {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaClient must be used within a <MediaProvider>');
  }
  return context.client;
}
