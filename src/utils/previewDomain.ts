import { getCachedConfig } from './config';

/**
 * Get preview domain
 * Server-side: directly reads from process.env
 * Client-side: gets from cached config (populated by ConfigProvider)
 * @returns Preview domain string
 */
export const getPreviewDomain = (): string => {
    const isBrowser = typeof window !== 'undefined';

    // Server-side: directly read from environment variable
    if (!isBrowser) {
        return process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '';
    }

    // Client-side: get from cached config
    const cached = getCachedConfig();

    return cached?.previewDomain || process.env.NEXT_PUBLIC_DOMAIN_PREVIEW || '';
};
