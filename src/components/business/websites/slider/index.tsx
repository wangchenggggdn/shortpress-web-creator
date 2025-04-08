'use client';

import React, { useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import { IconBrowser, IconChartBar, IconChevronLeft, IconArrowBack, IconUsers, IconSettings, IconCoin, IconArrowDown, IconChevronDown } from '@tabler/icons-react';
import { Avatar, Text, Menu } from '@mantine/core';
import { Website } from '@/types/website';
import WebsiteApi from '@/api/website';

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
    websiteId: string;
}

/**
 * Sidebar component with navigation menu and user profile
 * Provides collapsible navigation with user profile management
 * @returns React component with sidebar interface
 */
const WebsiteSidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse, websiteId }) => {
    const pathname = usePathname();
    const [currentWebsite, setCurrentWebsite] = useState<Website>();
    const [websites, setWebsites] = useState<Website[]>([]);
    const route = useRouter();

    /**
     * Navigation menu items configuration
     */
    const menuItems: MenuItem[] = [
        { icon: <IconBrowser size={20} />, label: 'Content', path: `/content` },
        { icon: <IconUsers size={20} />, label: 'Customers', path: `/customers` },
        { icon: <IconCoin size={20} />, label: 'Monetization', path: `/monetization` },
        { icon: <IconChartBar size={20} />, label: 'Analytics', path: `/analytics` },
        { icon: <IconSettings size={20} />, label: 'Settings', path: `/settings` },
    ];

    const getWebsite = async () => {
        const website = websites.find(item => item.siteId === websiteId);
        if (website) setCurrentWebsite(website);
    };

    const getWebsites = async () => {
        const res = await WebsiteApi.list();
        if (res.code !== 0) return [];
        const resD = await WebsiteApi.batchGet(res.data.items.join(','));
        if (resD.code === 0) setWebsites(resD.data.items);
    };

    /**
     * Check if a menu item is active based on current path
     * @param path Menu item path to check
     * @returns boolean indicating if the menu item is active
     */
    const isActive = (path: string) => {
        return pathname === `/websites/${websiteId}${path}`;
    };

    useEffect(() => {
        getWebsites();
    }, []);

    useEffect(() => {
        getWebsite();
    }, [websiteId, websites]);

    return (
        <div
            className={`
            fixed top-0 left-0 h-screen bg-layout transition-all duration-300
            rounded-r-[32px]
            ${collapsed ? 'w-16' : 'w-60'}
        `}
        >
            <div className="h-full w-full overflow-hidden rounded-r-[32px] cursor-pointer">
                <div
                    onClick={() => {
                        window.location.href = `/`;
                    }}
                    className="px-4 pt-4 pb-2 bg-white"
                >
                    <div className={`${collapsed ? 'p-1' : 'p-2'} flex items-center border-gray-400 border-[1px] rounded-full gap-2`}>
                        <IconArrowBack className={`${collapsed ? '' : 'ml-1'}`} size={20} />
                        {!collapsed && <div className="font-medium">Websites</div>}
                    </div>
                </div>

                <div className="px-4">
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <div className="flex py-2 items-center justify-between cursor-pointer border-b-[1px] border-gray-300">
                                <div className="flex">
                                    <Avatar src={currentWebsite?.logo ?? ''} radius="xl" size={32} />
                                    {!collapsed && (
                                        <div className="ml-3 overflow-hidden">
                                            <Text size="xl" fw={500} truncate>
                                                {currentWebsite?.name ?? ''}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                                <IconChevronDown size={28} stroke={1.5} />
                            </div>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {websites.map(website => {
                                return (
                                    <Menu.Item onClick={() => setCurrentWebsite(website)} key={website.siteId}>
                                        {website.name}
                                    </Menu.Item>
                                );
                            })}
                        </Menu.Dropdown>
                    </Menu>
                </div>

                {/* Navigation Menu */}
                <div className={`mt-4 flex-1 ${collapsed ? 'pr-2' : 'pr-12'}`}>
                    {menuItems.map((item, index) => {
                        return (
                            <div
                                key={item.path + index}
                                onClick={() => {
                                    route.replace(`/websites/${websiteId}${item.path}`);
                                }}
                                className={`
                       relative flex items-center gap-3 px-4 py-2 my-1 cursor-pointer
                       ${isActive(item.path) ? 'text-white' : 'text-black-purple'}
                       ${!collapsed && 'pl-6'}
                   `}
                            >
                                <div
                                    className={`
                           absolute inset-y-0 left-0 w-full
                           bg-primary rounded-r-full
                           transition-transform duration-300 origin-left
                           ${isActive(item.path) ? 'scale-x-110' : 'scale-x-0'}
                       `}
                                />
                                <span className="relative z-10 w-6">{item.icon}</span>
                                {!collapsed && <span className="relative z-10 text-base">{item.label}</span>}
                            </div>
                        );
                    })}
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

export default WebsiteSidebar;
