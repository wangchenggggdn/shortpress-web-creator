import React from 'react';
import WebsiteApi from '@/api/website';
import WebsitesView from '../../../../components/business/websites/websites';

/**
 * Websites management page component
 * Displays and manages user's websites with creation, editing, and deletion capabilities
 * @returns React component with website management interface
 */
interface WebsitesPageProps {}

const WebsitesPage: React.FC<WebsitesPageProps> = async () => {
    const websites = await WebsiteApi.fetchWebsites();
    return <WebsitesView websites={websites} />;
};

export default WebsitesPage;
