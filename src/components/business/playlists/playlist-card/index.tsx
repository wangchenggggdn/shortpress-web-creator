'use client';

import React from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Playlist } from '@/types/playlist';
import { dateFormatSecond } from '@/utils/formatUtil';

/**
 * Props interface for PlaylistCard component
 */
interface PlaylistCardProps {
    /** Playlist data to display */
    playlist: Playlist;
    /** Callback function when edit action is triggered */
    onEdit?: (id: string) => void;
    /** Callback function when delete action is triggered */
    onDelete?: (id: string) => void;
}

/**
 * Playlist card component
 * Displays playlist information with cover image, video count, and action menu
 * @returns React component with playlist card interface
 */
const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onEdit, onDelete }) => {
    const router = useRouter();

    /**
     * Handle card click to navigate to playlist detail page
     */
    const handleClick = () => {
        router.push(`/playlists/${playlist.playlistId}`);
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
            {/* Cover Image Container */}
            <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 shadow-md">
                {playlist.cover ? (
                    <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Cover</div>
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
                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit?.(playlist.playlistId)}>
                                Edit
                            </Menu.Item>
                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete?.(playlist.playlistId)}>
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-end justify-center">
                    {/* Video Count Label */}
                    <div className="mr-2 px-2 py-1 bg-black/50 rounded text-xs text-white">{playlist.videoCount} videos</div>
                    {/* Info Section */}
                    <div className="w-full mt-2 bg-layout p-2">
                        <h3 className="font-medium text-sm truncate" title={playlist.title}>
                            {playlist.title}
                        </h3>
                        <div className="mt-1 text-xs text-gray-500">{dateFormatSecond(playlist.createdAt)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistCard;
