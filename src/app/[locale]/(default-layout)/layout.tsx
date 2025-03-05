import React from 'react';
import MainLayout from '@/components/system/mainLayout';
import UploadProgressModal from '@/components/business/uploadProgressModal';

/**
 * Props interface for the DefaultLayout component
 */
interface DefaultLayoutProps {
    children: React.ReactNode;
}

/**
 * Default layout component that provides the main application structure
 * Includes the main layout wrapper and upload progress modal
 * @param children Child components to be rendered
 * @returns React component with main layout and upload progress modal
 */
const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
    return (
        <MainLayout>
            {children}
            <UploadProgressModal />
        </MainLayout>
    );
};

export default DefaultLayout;
