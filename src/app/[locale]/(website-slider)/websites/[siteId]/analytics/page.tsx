import React from 'react';
import AnalyticsView from '@/components/business/analytics-view';
import { retryRequest } from '@/api';
import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';

interface AnalyticsPageProps {}

const AnalyticsPage: React.FC<AnalyticsPageProps> = async () => {
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

    // 模拟交易数据，后续需要替换为真实API调用
    const mockTransactions = [
        {
            amount: 4.99,
            paymentMethod: 'Stripe',
            plan: '1000 coins',
            customer: 'hello@sparkdrama.com',
            date: '2025-03-30 12:00',
        },
        {
            amount: 4.99,
            paymentMethod: 'Stripe',
            plan: '1000 coins',
            customer: 'hello@sparkdrama.com',
            date: '2025-03-30 12:00',
        },
        {
            amount: 4.99,
            paymentMethod: 'Stripe',
            plan: '1000 coins',
            customer: 'hello@sparkdrama.com',
            date: '2025-03-30 12:00',
        },
        {
            amount: 4.99,
            paymentMethod: 'Stripe',
            plan: '1000 coins',
            customer: 'hello@sparkdrama.com',
            date: '2025-03-30 12:00',
        },
    ];

    return <AnalyticsView initialTransactions={mockTransactions} />;
};

export default AnalyticsPage;
