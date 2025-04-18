import React from 'react';
import AnalyticsView from '@/components/business/websites/analytics-view';
import { retryRequest } from '@/api';
import WebsiteApi from '@/api/website';
import { Website } from '@/types/website';

interface AnalyticsPageProps {}

const AnalyticsPage: React.FC<AnalyticsPageProps> = async () => {
    return <AnalyticsView />;
};

export default AnalyticsPage;
