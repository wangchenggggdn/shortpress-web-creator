/**
 * Runtime configuration cache
 * Stores configuration passed from server to client
 */
let configCache: {
    domain: string;
    baseUrl: string;
    imageDomain: string;
    videoDomain: string;
    nodeEnv: string;
    previewDomain: string;
} | null = null;

/**
 * Set runtime configuration cache
 * @param config Runtime configuration object
 */
export const setConfigCache = (config: { domain: string; baseUrl: string; imageDomain: string; videoDomain: string; nodeEnv: string; previewDomain: string }) => {
    configCache = config;
};

/**
 * Get cached runtime configuration
 * @returns Cached configuration or null
 */
export const getCachedConfig = () => {
    return configCache;
};

/**
 * Get base URL for API requests
 * Server-side: uses fixed URL http://shortpress-server:8000
 * Client-side: uses dynamic URL from runtime config
 * @returns Base URL string
 */
export const getBaseUrl = (): string => {
    const isBrowser = typeof window !== 'undefined';

    // Server-side: use fixed URL
    if (!isBrowser) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'dev' || process.env.NEXT_PUBLIC_NODE_ENV === 'pro') {
            return process.env.NEXT_PUBLIC_BASE_URL || '';
        } else {
            return 'http://shortpress-server:8000';
        }
    }

    // Client-side: use dynamic URL from runtime config
    const cached = getCachedConfig();
    return cached?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || '';
};
