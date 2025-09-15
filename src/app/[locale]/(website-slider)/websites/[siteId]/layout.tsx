import WebsiteClient from '@/components/business/websites/websiteClient';
import React from 'react';

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
    return <WebsiteClient params={{ siteId: params.siteId }}>{children}</WebsiteClient>;
};

export default DefaultLayout;
