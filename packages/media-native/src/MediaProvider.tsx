import React, { createContext, useContext, useMemo } from 'react';
import { createMediaClient, MediaClient, MediaClientConfig } from 'media-core';

interface MediaContextValue {
  client: MediaClient;
}

const NativeMediaContext = createContext<MediaContextValue | null>(null);

export interface NativeMediaProviderProps {
  client?: MediaClient;
  config?: MediaClientConfig;
  children: React.ReactNode;
}

export const NativeMediaProvider: React.FC<NativeMediaProviderProps> = ({
  client: propClient,
  config,
  children,
}) => {
  const client = useMemo(() => {
    if (propClient) return propClient;
    if (config) return createMediaClient(config);
    throw new Error('[NativeMediaProvider] Must provide either a `client` instance or a `config` object.');
  }, [propClient, config]);

  const value = useMemo(() => ({ client }), [client]);

  return <NativeMediaContext.Provider value={value}>{children}</NativeMediaContext.Provider>;
};

export function useNativeMediaClient(): MediaClient {
  const context = useContext(NativeMediaContext);
  if (!context) {
    throw new Error('useNativeMediaClient must be used within a <NativeMediaProvider>');
  }
  return context.client;
}
