'use client';

import React, { use, useEffect, useState } from 'react';
import Sidebar from '../sidebar';
import { Website } from '@/types/website';
import WebsiteApi from '@/api/website';
import useUserStore from '@/store/useUserStore';

/**
 * Props interface for MainLayout component
 */
interface MainLayoutProps {
    /** Child elements to display in the main content area */
    children: React.ReactNode;
}

/**
 * Main layout component with collapsible sidebar
 * Provides responsive layout with sidebar navigation
 * @returns React component with main layout interface
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-layout-page">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
            </div>

            {/* Main Content - Adjusts margin based on sidebar state */}
            <div
                className={`
                    flex-1 flex flex-col transition-all duration-300
                    md:ml-[240px]
                    ${collapsed ? 'md:ml-[60px]' : ''}
                `}
            >
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
};

export default MainLayout;
