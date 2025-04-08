'use client';

import React from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { IconCopy, IconDots, IconEye, IconEyeClosed, IconPencil, IconTrash } from '@tabler/icons-react';
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
    /** Publication status (2: Published, 1: Unpublished) */
    status: number;
    /** Callback function when edit action is triggered */
    publishChange?: () => void;
    /** Callback function when delete action is triggered */
    onDelete?: (id: string) => void;
}

/**
 * Website card component
 * Displays website information with logo, status, and action menu
 * @returns React component with website card interface
 */
const WebsiteCard: React.FC<WebsiteCardProps> = ({ siteId, name, domain, path, logo, status, publishChange, onDelete }) => {
    const router = useRouter();
    const [published, setPublished] = React.useState(status);

    /**
     * Handle card click to navigate to website detail page
     */
    const handleClick = () => {
        router.push(`/websites/${siteId}/content`);
    };

    const handleCopyLink = () => {};

    /**
     * Handle menu click to prevent card click event
     * @param e Mouse event
     */
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="group cursor-pointer shadow-md  rounded-lg p-2" onClick={handleClick}>
            {/* Logo Container */}
            <div className="relative  overflow-hidden ">
                <div className="h-16 w-16 bg-[#F4F4F7]">
                    {logo ? (
                        <img src={logo} alt={name} className="rounded-lg object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No logo</div>
                    )}
                </div>

                {/* Action Menu */}
                <div className="absolute top-2 right-2" onClick={handleMenuClick}>
                    <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                            <IconDots size={16} color="black" />
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => handleCopyLink()}>
                                Copy URL
                            </Menu.Item>
                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={handleClick}>
                                View Site
                            </Menu.Item>
                            <Menu.Item
                                leftSection={published === 1 ? <IconEye size={14} /> : <IconEyeClosed size={14} />}
                                color={published === 2 ? 'red' : 'green'}
                                onClick={() => {
                                    setPublished(published !== 2 ? 2 : 1);
                                    publishChange?.();
                                }}
                            >
                                {published !== 2 ? 'Publish' : 'Unpublish'}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>

                {/* Status Label */}
                <div className={`absolute top-1 left-1 rounded-full border-[1px] border-white h-3 w-3 text-xs ${published ? 'bg-green-500' : 'bg-red-500'} capitalize`}></div>
            </div>

            {/* Info Section */}
            <div className="mt-2">
                <div className="mt-1 text-xs text-gray-500">{domain + '/' + path}</div>
                <h2 className="font-medium text-lg line-clamp-2" title={name}>
                    {name}
                </h2>
            </div>
        </div>
    );
};

export default WebsiteCard;
