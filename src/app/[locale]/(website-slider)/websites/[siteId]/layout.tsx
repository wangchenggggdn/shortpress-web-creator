'use client';
import WebsiteSidebar from '@/components/business/websites/slider';
import React, { useState } from 'react';

/**
 * Props interface for the DefaultLayout component
 */
interface DefaultLayoutProps {
    children: React.ReactNode;
    params: {
        siteId: string;
    };
}

/**
 * Default layout component that provides the main application structure
 * Includes the main layout wrapper and upload progress modal
 * @param children Child components to be rendered
 * @returns React component with main layout and upload progress modal
 */
const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children, params }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-layout-page">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <WebsiteSidebar websiteId={params.siteId} collapsed={collapsed} onCollapse={setCollapsed} />
            </div>

            {/* Main Content - Adjusts margin based on sidebar state */}
            <div
                className={`
                    flex-1 flex flex-col transition-all duration-300
                    md:ml-[240px]
                    ${collapsed ? 'md:ml-[60px]' : ''}
                `}
            >
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
};

export default DefaultLayout;
