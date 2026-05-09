/* eslint-disable @next/next/no-img-element */
import type { Playlist } from '@/types/playlist';
import { ActionIcon, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';

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
    /** Callback function when price is changed */
    onPriceChange: () => void;
}

/**
 * Website playlist item component
 * Displays a single playlist item with cover image, title, video count and delete button
 * @returns React component for displaying a playlist item
 */
const WebsitePlaylistItem: React.FC<WebsitePlaylistItemProps> = ({ playlist, checked, onCheck, onDelete, onClick, onPriceChange }) => {
    return (
        <div className="flex items-center bg-white hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer" onClick={onClick}>
            <div className="flex items-center flex-1">
                {/* <input type="checkbox" className="mr-3 w-4 h-4 rounded border-gray-300 accent-primary" checked={checked} onChange={e => onCheck(e.target.checked)} /> */}
                <div className="w-16 h-16 relative bg-gray-200 rounded overflow-hidden mr-3 shrink-0">
                    {playlist.cover &&
                        (playlist.cover.toLowerCase().includes('.webm') ? (
                            <video src={playlist.cover} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                            <img src={playlist.cover} alt={playlist.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                        ))}
                </div>
                <div>
                    <div className="text-black-purple text-sm line-clamp-3">{playlist.title}</div>
                    <div className="text-xs text-gray-500">{playlist.videoCount} videos</div>
                </div>
            </div>
            <Button
                variant="subtle"
                color="primary"
                onClick={e => {
                    e.stopPropagation();
                    onPriceChange();
                }}
            >
                Set Price
            </Button>
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
