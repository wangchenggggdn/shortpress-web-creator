'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconVideo, IconPlaylist, IconBrowser, IconChartBar, IconUsers, IconCoin, IconChevronLeft, IconLogout } from '@tabler/icons-react';
import { Avatar, Text, Menu } from '@mantine/core';
import useUserStore from '@/store/useUserStore';
import Cookies from 'js-cookie';
import { useRouter } from '@/libs/navigation';
import CookieMap from '@/config/cookie-map';

/**
 * Interface for menu item configuration
 */
interface MenuItem {
    /** Icon component for the menu item */
    icon: React.ReactNode;
    /** Display label for the menu item */
    label: string;
    /** Navigation path for the menu item */
    path: string;
}

/**
 * Props interface for Sidebar component
 */
interface SidebarProps {
    /** Whether the sidebar is collapsed */
    collapsed: boolean;
    /** Callback function when sidebar collapse state changes */
    onCollapse: (collapsed: boolean) => void;
}

/**
 * Navigation menu items configuration
 */
const menuItems: MenuItem[] = [
    { icon: <IconHome size={20} />, label: 'Home', path: '/' },
    { icon: <IconVideo size={20} />, label: 'Videos', path: '/videos' },
    { icon: <IconPlaylist size={20} />, label: 'Playlists', path: '/playlists' },
    { icon: <IconBrowser size={20} />, label: 'Websites', path: '/websites' },
    { icon: <IconChartBar size={20} />, label: 'Analytics', path: '/analytics' },
    { icon: <IconUsers size={20} />, label: 'Members', path: '/members' },
    { icon: <IconCoin size={20} />, label: 'Monetize', path: '/monetize' },
];

/**
 * Sidebar component with navigation menu and user profile
 * Provides collapsible navigation with user profile management
 * @returns React component with sidebar interface
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
    const pathname = usePathname();
    const { userInfo } = useUserStore();
    const router = useRouter();

    /**
     * Check if a menu item is active based on current path
     * @param path Menu item path to check
     * @returns boolean indicating if the menu item is active
     */
    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    /**
     * Handle user logout
     * Clears user state and redirects to login page
     */
    const handleLogout = () => {
        Cookies.remove(CookieMap.UserState);
        localStorage.removeItem('sites');
        router.push('/login');
    };

    return (
        <div
            className={`
            fixed top-0 left-0 h-screen bg-layout transition-all duration-300
            rounded-r-[32px]
            ${collapsed ? 'w-16' : 'w-60'}
        `}
        >
            <div className="h-full w-full overflow-hidden rounded-r-[32px]">
                {/* Logo Section */}
                <div className="h-16 flex items-center px-4">
                    <Link href="/" className="text-primary text-2xl font-bold">
                        {collapsed ? 'S' : 'Shortify'}
                    </Link>
                </div>

                {/* Navigation Menu */}
                <div className={`flex-1 ${collapsed ? 'pr-2' : 'pr-12'} py-4`}>
                    {menuItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                                relative flex items-center gap-3 px-4 py-2 my-1
                                ${isActive(item.path) ? 'text-white' : 'text-black-purple'}
                                ${!collapsed && 'pl-6'}
                            `}
                        >
                            <div
                                className={`
                                    absolute inset-y-0 left-0 w-full
                                    bg-primary rounded-r-full
                                    transition-transform duration-300 origin-left
                                    ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0'}
                                `}
                            />
                            <span className="relative z-10 w-6">{item.icon}</span>
                            {!collapsed && <span className="relative z-10 text-base">{item.label}</span>}
                        </Link>
                    ))}
                </div>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <div className="flex items-center cursor-pointer">
                                <Avatar src={userInfo?.avatarUrl} radius="xl" size={32} />
                                {!collapsed && (
                                    <div className="ml-3 overflow-hidden">
                                        <Text size="sm" fw={500} truncate>
                                            {userInfo?.nickname}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <div className="p-3 border-b">
                                <div className="flex items-center">
                                    <Avatar src={userInfo?.avatarUrl} radius="xl" size={32} />
                                    <div className="ml-3 overflow-hidden">
                                        <Text size="sm" fw={500} truncate>
                                            {userInfo?.nickname}
                                        </Text>
                                        <Text size="xs" c="dimmed" truncate>
                                            {userInfo?.email}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                            <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                                Logout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>

            {/* Collapse Toggle Button */}
            <button
                onClick={() => onCollapse(!collapsed)}
                className="absolute top-1/2 -right-3 w-6 h-6 bg-white border rounded-full 
                    shadow-md flex items-center justify-center hover:bg-gray-50"
            >
                <IconChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
        </div>
    );
};

export default Sidebar;
