import React from 'react';

/**
 * Props interface for the NoLayout component
 */
interface NoLayoutProps {
    children: React.ReactNode;
}

/**
 * Minimal layout component that renders children without any wrapper
 * Used for pages that don't require any layout structure
 * @param children Child components to be rendered
 * @returns React component without any layout wrapper
 */
const NoLayout: React.FC<NoLayoutProps> = ({ children }) => {
    return <>{children}</>;
};

export default NoLayout;
