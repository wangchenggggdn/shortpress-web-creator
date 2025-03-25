import React from 'react';
import HomePage from './components/home';
import CreatorApi from '@/api/creator';
import { redirect } from 'next/navigation';

/**
 * Home page component that displays user statistics and content management options
 * Shows a welcome message, stats cards, and a call-to-action for content creation
 * @returns React component with dashboard layout
 */
const MainPage = async () => {
    const res = await CreatorApi.stats();
    if (res.code === 0 && res.data.siteCount === 0) {
        redirect('/create-site');
    }
    return <HomePage stats={res.data} />;
};

export default MainPage;
