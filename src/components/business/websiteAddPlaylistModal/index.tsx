import React, { useEffect } from 'react';
import Image from 'next/image';
import { Button, Pagination } from '@mantine/core';
import Search from '@/components/common/search';
import { IconX } from '@tabler/icons-react';
import { Playlist } from '@/types/playlist';
import PlaylistApi from '@/api/playlist';

/**
 * Props interface for AddContentModal component
 */
interface AddContentModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when playlists are added to site */
    onAdd: (selectedItems: string[]) => void;
}

/**
 * Modal component for adding playlists to a website
 * Provides search, selection, and pagination functionality
 * @returns React component with playlist selection interface
 */
const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
    const [activePage, setActivePage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [orderType, setOrderType] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [total, setTotal] = React.useState(0);

    // Fetch playlists when search parameters change
    useEffect(() => {
        PlaylistApi.search({
            page: activePage,
            pageSize: pageSize,
            orderType: orderType,
            keyword: searchQuery,
        }).then(res => {
            setPlaylists(res.data.items);
            setTotal(res.data.total);
        });
    }, [searchQuery, activePage, orderType]);

    /**
     * Handle select all playlists action
     */
    const handleSelectAll = () => {
        if (selectedItems.length === playlists.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(playlists.map(item => item.playlistId));
        }
    };

    /**
     * Handle search input changes
     * @param value Search query string
     */
    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-lg z-50 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 px-4">
                        <h2 className="text-xl font-semibold">Add playlists to site</h2>
                        <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                            <IconX size={20} />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 px-4 flex flex-row items-center gap-4">
                        <div className="flex-1">
                            <Search value={searchQuery} onChange={handleSearch} placeholder="Search Playlists" className="w-full" />
                        </div>
                        <div className="text-base font-medium text-gray-500">{'Selected:' + selectedItems.length}</div>
                    </div>

                    {/* Playlist Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto px-4">
                        {playlists.map(item => (
                            <div key={item.playlistId} className="relative bg-gray-50 rounded-lg p-2">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.playlistId)}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setSelectedItems([...selectedItems, item.playlistId]);
                                        } else {
                                            setSelectedItems(selectedItems.filter(id => id !== item.playlistId));
                                        }
                                    }}
                                    className="absolute top-2 left-2 z-10"
                                />
                                <div className="aspect-[9/16] relative bg-gray-200 rounded-md overflow-hidden mb-2">
                                    {item.cover && <img src={item.cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" />}
                                </div>
                                <div className="text-sm">
                                    <div>{item.videoCount} videos</div>
                                    <div className="text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {playlists.length > 0 && (
                        <div className="py-4">
                            <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(total / 20)} color="primary" radius="xl" className="flex justify-center" />
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className=" bg-white border-t p-4">
                        <div className="flex justify-between items-center">
                            <Button variant="subtle" onClick={handleSelectAll}>
                                Select all
                            </Button>
                            <Button variant="filled" onClick={() => onAdd(selectedItems)}>
                                Add to site
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddContentModal;
