import React from 'react';
import MonetizeView from '@/components/business/websites/monetize-view';
import { retryRequest } from '@/api';
import AdsApi from '@/api/ads';
import { Website } from '@/types/website';
import WebsiteApi from '@/api/website';

const MonetizePage: React.FC = async () => {
    return <MonetizeView />;
};

export default MonetizePage;
