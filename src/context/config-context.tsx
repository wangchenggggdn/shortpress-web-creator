'use client';

import React, { createContext, ReactNode, useContext, useMemo } from 'react';

/**
 * Runtime configuration interface
 * Contains all environment variables that need to be passed from server to client
 */
export interface RuntimeConfig {
    domain: string; // Application domain
    baseUrl: string; // Base API URL for client
    imageDomain: string; // Image domain
    videoDomain: string; // Video domain
    nodeEnv: string; // Node environment
    previewDomain: string; // Preview domain
}

type ConfigContextValue = {
    config: RuntimeConfig | null;
};

const ConfigContext = createContext<ConfigContextValue>({
    config: null,
});

interface ConfigProviderProps {
    children: ReactNode;
    config: RuntimeConfig;
}

/**
 * ConfigProvider component
 * Provides runtime configuration to all client components
 */
export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, config }) => {
    const value = useMemo(
        () => ({
            config,
        }),
        [config]
    );

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

/**
 * Hook to access runtime configuration
 * @returns Runtime configuration object
 */
export const useRuntimeConfig = (): ConfigContextValue => {
    return useContext(ConfigContext);
};
