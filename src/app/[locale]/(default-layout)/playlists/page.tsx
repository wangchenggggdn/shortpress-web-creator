'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Select, Menu, Image, Pagination, Card } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Header from '@/components/system/header';
import Search from '@/components/common/search';
import PlaylistCard from '@/components/business/playlistCard';
import PlaylistApi from '@/api/playlist';
import { Playlist } from '@/types/playlist';
import PlaylistDetailEdit from '@/components/business/playlistDetailEdit';
import orderImage from '@/assets/images/public/order.webp';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';
import { PlaylistArgs } from '@/api/args';
import ConfirmDialog from '@/components/common/ConfirmDialog';

/**
 * Playlists management page component
 * Handles playlist listing, creation, editing, and deletion with search and filtering capabilities
 * @returns React component with playlist management interface
 */
const PlaylistsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<string | null>('-1');
    const [orderType, setOrderType] = useState<number>(0);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const playlistToDeleteRef = useRef<string | null>(null);

    /**
     * Calculate number of items to display per page based on screen width
     * @returns Number of items per page
     */
    const getItemsPerPage = () => {
        let itemsPerPage = 20;
        if (window.innerWidth >= 1536) {
            itemsPerPage = 16;
        } else if (window.innerWidth >= 1280) {
            itemsPerPage = 12;
        } else if (window.innerWidth >= 768) {
            itemsPerPage = 8;
        } else if (window.innerWidth >= 640) {
            itemsPerPage = 6;
        } else {
            itemsPerPage = 4;
        }
        return itemsPerPage;
    };

    /**
     * Fetch playlists from the API
     */
    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await PlaylistApi.list({
                page: activePage,
                pageSize: getItemsPerPage(),
                orderType: orderType,
                status: Number(status),
            });
            setTotal(res.data.total);
            setPlaylists(res.data.items);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Search playlists based on current filters
     */
    const searchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await PlaylistApi.search({
                keyword: searchQuery,
                status: Number(status),
                orderType: orderType,
                page: activePage,
                pageSize: getItemsPerPage(),
            });
            setTotal(res.data.total);
            setPlaylists(res.data.items);
        } catch (error) {
            console.error('Failed to search playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch playlists when status or order type changes
    useEffect(() => {
        searchPlaylists();
    }, [status, orderType]);

    // Fetch playlists when search query or page changes
    useEffect(() => {
        searchPlaylists();
    }, [searchQuery, activePage]);

    /**
     * Handle search input changes
     * @param value Search query string
     */
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    /**
     * Handle playlist edit action
     * @param id Playlist ID to edit
     */
    const handleEdit = useCallback(
        (id: string) => {
            const playlist = playlists.find(p => p.playlistId === id);
            if (playlist) {
                setEditingPlaylist(playlist);
            }
        },
        [playlists]
    );

    /**
     * Handle playlist creation action
     */
    const handleCreatePlaylist = useCallback(() => {
        setIsCreating(true);
    }, []);

    /**
     * Handle playlist save action
     * @param playlistData Playlist data to save
     * @param coverFile Optional cover image file
     */
    const handleSave = useCallback(async (playlistData: PlaylistArgs.Modify, coverFile?: File) => {
        setLoading(true);

        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                playlistData.cover = res.data ?? '';
            }
        }
        if (playlistData.playlistId) {
            PlaylistApi.modify(playlistData).then(res => {
                if (res.code === 0) {
                    saveSuccess();
                } else {
                    toast.error(res.info);
                }
            });
        } else {
            PlaylistApi.create({ ...playlistData, title: playlistData.title ?? '' }).then(res => {
                if (res.code === 0) {
                    saveSuccess();
                } else {
                    toast.error(res.info);
                }
            });
        }

        setLoading(false);
    }, []);

    /**
     * Handle successful save operation
     */
    const saveSuccess = () => {
        setEditingPlaylist(null);
        setIsCreating(false);
        toast.success('save success');
        fetchPlaylists();
    };

    /**
     * Handle playlist deletion click
     * @param playlistId ID of playlist to delete
     */
    const handleDeleteClick = (playlistId: string) => {
        playlistToDeleteRef.current = playlistId;
        setDeleteModalOpen(true);
    };

    /**
     * Handle playlist deletion confirmation
     */
    const handleConfirmDelete = () => {
        const playlistId = playlistToDeleteRef.current;
        if (!playlistId) return;

        PlaylistApi.delete([playlistId]);
        setPlaylists(playlists.filter(item => item.playlistId !== playlistId));
        setDeleteModalOpen(false);
        playlistToDeleteRef.current = null;
        toast.success('Playlist deleted successfully');
    };

    return (
        <div className="flex flex-col h-screen">
            <Header>
                <Button leftSection={<IconPlus size={16} />} variant="filled" color="primary" onClick={handleCreatePlaylist}>
                    New Playlist
                </Button>
            </Header>

            {/* Search Bar */}
            <div className="px-11 py-4 grid grid-cols-4">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{playlists.length} playlist</span>
                </div>

                {/* Search Input */}
                <div className="col-span-2 flex justify-center items-center">
                    <Search className="w-80" value={searchQuery} onChange={handleSearch} placeholder="Search playlist" />
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-4">
                    <Select
                        value={status}
                        onChange={setStatus}
                        data={[
                            { value: '-1', label: 'All' },
                            { value: '1', label: 'Published' },
                            { value: '0', label: 'Unpublished' },
                        ]}
                        placeholder="All"
                        className="w-36"
                        variant="filled"
                    />

                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <Image src={orderImage.src} alt="order" className="w-5 h-5" />
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Item onClick={() => setOrderType(1)}>Title</Menu.Item>
                            <Menu.Item onClick={() => setOrderType(0)}>Created time</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>

            {/* Playlist Grid Container */}
            <div className="flex-1 px-6 pb-6 min-h-0">
                <div className="h-full p-2 flex flex-col bg-layout rounded-lg">
                    <div className="flex-1 min-h-0 ">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <span>Loading...</span>
                            </div>
                        ) : playlists.length > 0 ? (
                            <div className="h-full overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4">
                                    {playlists.map(playlist => (
                                        <PlaylistCard playlist={playlist} key={playlist.playlistId} onEdit={handleEdit} onDelete={handleDeleteClick} />
                                    ))}
                                </div>
                            </div>
                        ) : searchQuery.length > 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-black-purple text-lg mb-2">No playlists found</p>
                                <p className="text-gray-500 text-sm">No playlists with filtered condition</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 mb-4">No playlists available</p>
                                <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {playlists.length > 0 && (
                        <div className="pb-3 flex-shrink-0">
                            <Pagination
                                value={activePage}
                                onChange={setActivePage}
                                total={Math.ceil(total / getItemsPerPage())}
                                color="primary"
                                radius="xl"
                                className="flex justify-center"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {(editingPlaylist || isCreating) && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-50"
                        onClick={() => {
                            setEditingPlaylist(null);
                            setIsCreating(false);
                        }}
                    />
                    <div className="fixed top-0 right-0 z-50">
                        <PlaylistDetailEdit
                            playlistOld={editingPlaylist ?? undefined}
                            onClose={() => {
                                setEditingPlaylist(null);
                                setIsCreating(false);
                            }}
                            onSave={handleSave}
                        />
                    </div>
                </>
            )}

            <ConfirmDialog
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this playlist? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default PlaylistsPage;
