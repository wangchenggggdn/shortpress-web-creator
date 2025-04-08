import React from 'react';
import MonetizeView from '@/components/business/monetize-view';
import { retryRequest } from '@/api';
import AdsApi from '@/api/ads';
import { Website } from '@/types/website';
import WebsiteApi from '@/api/website';

interface MonetizePageProps {}

const MonetizePage: React.FC<MonetizePageProps> = async () => {
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

    // 在服务端获取初始数据
    const response = await retryRequest(async () => {
        return await AdsApi.list({ siteId: websites[0].siteId });
    });

    const initialAdUnits = response?.data?.items ?? [];

    return <MonetizeView initialAdUnits={initialAdUnits} />;
};

export default MonetizePage;
