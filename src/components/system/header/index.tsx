'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getPageTitleFromPath } from '@/utils/path';

/**
 * Props interface for Header component
 */
interface HeaderProps {
    /** Child elements to display in the header */
    children?: React.ReactNode;
    /** Custom title element to override default page title */
    customTitle?: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Header component for displaying page title and additional content
 * Automatically shows page title based on current path or custom title if provided
 * @returns React component with header interface
 */
const Header: React.FC<HeaderProps> = ({ children, customTitle, className = 'border-b flex items-center justify-between' }) => {
    const pathname = usePathname();

    return (
        <div className={`${className}`}>
            {customTitle ? (
                <div className="h-16 flex items-center px-6 text-black-purple">{customTitle}</div>
            ) : (
                <div className="h-16 flex items-center px-6">
                    <h2 className="text-xl font-medium text-black-purple">{getPageTitleFromPath(pathname)}</h2>
                </div>
            )}
            {children && <div className="px-6">{children}</div>}
        </div>
    );
};

export default Header;
