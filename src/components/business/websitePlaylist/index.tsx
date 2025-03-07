import React, { useEffect } from 'react';
import type { Playlist } from '@/types/playlist';
import Search from '@/components/common/search';
import { Button, Pagination } from '@mantine/core';
import WebsitePlaylistItem from './playlistItem';
import { useRouter } from 'next/navigation';
import { IconPlus } from '@tabler/icons-react';

/**
 * Props interface for WebsitePlaylist component
 */
interface WebsitePlaylistProps {
    /** Array of playlists to display */
    playlists: Playlist[];
    /** Total number of playlists */
    total?: number;
    /** Current page number */
    page?: number;
    /** Number of items per page */
    pageSize?: number;
    children?: React.ReactNode;
    /** Callback function when page changes */
    onPageChange?: (page: number) => void;
    /** Callback function when search query changes */
    onSearch?: (value: string, page: number, pageSize: number) => void;
    /** Callback function when playlist is deleted */
    onDelete?: (playlistId: string) => void;
}

/**
 * Website playlist component
 * Displays a list of playlists with search, pagination, and selection capabilities
 * @returns React component with playlist management interface
 */
const WebsitePlaylist: React.FC<WebsitePlaylistProps> = ({ playlists, children, total = 0, page = 1, pageSize = 10, onPageChange, onSearch, onDelete }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const router = useRouter();

    // Trigger search when query changes
    useEffect(() => {
        if (onSearch) {
            onSearch(searchQuery, page, pageSize);
        }
    }, [searchQuery]);

    /**
     * Handle search input changes
     * @param value Search query string
     */
    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    /**
     * Handle select all playlists
     * @param checked Whether to select or deselect all
     */
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(playlists.map(item => item.playlistId));
        } else {
            setSelectedItems([]);
        }
    };

    /**
     * Handle individual playlist selection
     * @param id Playlist ID
     * @param checked Whether to select or deselect the playlist
     */
    const handleSelectItem = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, id]);
        } else {
            setSelectedItems(prev => prev.filter(itemId => itemId !== id));
        }
    };

    /**
     * Handle playlist deletion
     * @param id Playlist ID to delete
     */
    const handleDelete = (id: string) => {
        onDelete && onDelete(id);
    };

    /**
     * Handle playlist click to navigate to detail page
     * @param id Playlist ID to navigate to
     */
    const handlePlaylistClick = (id: string) => {
        router.push(`/playlists/${id}`);
    };

    return (
        <div className="bg-layout rounded-[32px] p-6 flex flex-col h-[calc(100vh-160px)]">
            {/* Search Bar */}
            <div className="mb-4 flex items-center gap-3">
                {/* <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                    checked={selectedItems.length === playlists.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                /> */}
                <div className="flex-1">
                    <Search value={searchQuery} onChange={handleSearch} placeholder="Search playlist" className="bg-white/80" />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="space-y-2">
                    {playlists.map(playlist => (
                        <div key={playlist.playlistId} className="group">
                            <WebsitePlaylistItem
                                playlist={playlist}
                                checked={selectedItems.includes(playlist.playlistId)}
                                onCheck={checked => handleSelectItem(playlist.playlistId, checked)}
                                onDelete={() => handleDelete(playlist.playlistId)}
                                onClick={() => handlePlaylistClick(playlist.playlistId)}
                            />
                        </div>
                    ))}
                </div>
                {children}
            </div>
            {total > 0 && (
                <div className="pt-4 mt-4">
                    <Pagination value={page} onChange={onPageChange} total={Math.ceil(total / pageSize)} color="primary" radius="xl" className="flex justify-center" />
                </div>
            )}
        </div>
    );
};

export default WebsitePlaylist;
