import React from 'react';
import NextImage from 'next/image';
import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { Playlist } from '@/types/playlist';

/**
 * Props interface for WebsitePlaylistItem component
 */
interface WebsitePlaylistItemProps {
    /** Playlist data */
    playlist: Playlist;
    /** Whether the item is checked */
    checked: boolean;
    /** Callback function when checkbox state changes */
    onCheck: (checked: boolean) => void;
    /** Callback function when delete button is clicked */
    onDelete: () => void;
    /** Callback function when item is clicked */
    onClick: () => void;
}

/**
 * Website playlist item component
 * Displays a single playlist item with cover image, title, video count and delete button
 * @returns React component for displaying a playlist item
 */
const WebsitePlaylistItem: React.FC<WebsitePlaylistItemProps> = ({ playlist, checked, onCheck, onDelete, onClick }) => {
    return (
        <div className="flex items-center bg-white hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer" onClick={onClick}>
            <div className="flex items-center flex-1">
                {/* <input type="checkbox" className="mr-3 w-4 h-4 rounded border-gray-300 accent-primary" checked={checked} onChange={e => onCheck(e.target.checked)} /> */}
                <div className="w-16 h-16 relative bg-gray-200 rounded overflow-hidden mr-3">
                    {playlist.cover && <NextImage src={playlist.cover} alt={playlist.title} fill className="object-cover" unoptimized />}
                </div>
                <div>
                    <div className="text-black-purple text-sm">{playlist.title}</div>
                    <div className="text-xs text-gray-500">{playlist.videoCount} videos</div>
                </div>
            </div>
            <ActionIcon
                variant="subtle"
                color="red"
                onClick={e => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <IconTrash size={16} />
            </ActionIcon>
        </div>
    );
};

export default WebsitePlaylistItem;
