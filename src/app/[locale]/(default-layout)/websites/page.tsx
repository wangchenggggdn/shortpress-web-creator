import React from 'react';
import WebsiteApi from '@/api/website';
import WebsitesView from '../../../../components/business/websites/websites';
import { Website } from '@/types/website';
import { redirect } from 'next/navigation';
/**
 * Websites management page component
 * Displays and manages user's websites with creation, editing, and deletion capabilities
 * @returns React component with website management interface
 */
interface WebsitesPageProps {}

const WebsitesPage: React.FC<WebsitesPageProps> = async () => {
    /**
     * Fetch websites from API and update local storage
     */
    const fetchWebsites = async (): Promise<Website[]> => {
        const res = await WebsiteApi.list();
        if (res.code !== 0 && (res.data?.items ?? []).length === 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (resD.code !== 0 && (resD.data?.items ?? []).length === 0) return [];
        return resD.data.items;
    };

    const websites = await fetchWebsites();

    if (websites.length >= 1) {
        redirect(`/websites/${websites[0].siteId}`);
    }

    return <WebsitesView websites={websites} />;
};

export default WebsitesPage;
