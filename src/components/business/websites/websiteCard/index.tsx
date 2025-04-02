'use client';

import React from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

/**
 * Props interface for WebsiteCard component
 */
interface WebsiteCardProps {
    /** Unique identifier for the website */
    siteId: string;
    /** Name of the website */
    name: string;
    /** Domain name of the website */
    domain: string;
    /** URL path of the website */
    path: string;
    /** Optional logo image URL */
    logo?: string;
    /** Publication status (1: Published, 0: Unpublished) */
    status: number;
    /** Callback function when edit action is triggered */
    onEdit?: (id: string) => void;
    /** Callback function when delete action is triggered */
    onDelete?: (id: string) => void;
}

/**
 * Website card component
 * Displays website information with logo, status, and action menu
 * @returns React component with website card interface
 */
const WebsiteCard: React.FC<WebsiteCardProps> = ({ siteId, name, domain, path, logo, status, onEdit, onDelete }) => {
    const router = useRouter();

    /**
     * Handle card click to navigate to website detail page
     */
    const handleClick = () => {
        router.push(`/websites/${siteId}`);
    };

    /**
     * Handle menu click to prevent card click event
     * @param e Mouse event
     */
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="group cursor-pointer" onClick={handleClick}>
            {/* Logo Container */}
            <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-[#F4F4F7]">
                {logo ? (
                    <img src={logo} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No logo</div>
                )}

                {/* Action Menu */}
                <div className="absolute top-2 right-2" onClick={handleMenuClick}>
                    <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                            <ActionIcon variant="filled" className="bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconDots size={16} color="white" />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit?.(siteId)}>
                                Edit
                            </Menu.Item>
                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete?.(siteId)}>
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>

                {/* Status Label */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white capitalize">{status === 1 ? 'Published' : 'Unpublished'}</div>
            </div>

            {/* Info Section */}
            <div className="mt-2">
                <h3 className="font-medium text-sm line-clamp-2" title={name}>
                    {name}
                </h3>
                <div className="mt-1 text-xs text-gray-500">{domain + '/' + path}</div>
            </div>
        </div>
    );
};

export default WebsiteCard;
