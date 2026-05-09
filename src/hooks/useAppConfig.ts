/**
 * Hook to access application runtime configuration
 * This hook provides access to environment variables passed from server to client
 * @returns Runtime configuration object
 */
import { useRuntimeConfig } from '@/context/config-context';

export const useAppConfig = () => {
    const { config } = useRuntimeConfig();
    return config;
};

