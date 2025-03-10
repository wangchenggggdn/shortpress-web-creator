import React from 'react';
import WebsiteApi from '@/api/website';
import WebsitesView from './comment/websites';
import { Website } from '@/types/website';
/**
 * Websites management page component
 * Displays and manages user's websites with creation, editing, and deletion capabilities
 * @returns React component with website management interface
 */
const WebsitesPage = async () => {
    /**
     * Fetch websites from API and update local storage
     */
    const fetchWebsites = async (): Promise<Website[]> => {
        const res = await WebsiteApi.list();
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        return resD.data.items;
    };

    const websites = await fetchWebsites();

    return <WebsitesView websites={websites} />;
};

export default WebsitesPage;
