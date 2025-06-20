'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TextInput, Checkbox } from '@mantine/core';
import { IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { Playlist } from '@/types/playlist';
import PlaylistApi from '@/api/playlist';
import useEditorStore from '@/store/useEditorStore';
import { InView } from 'react-intersection-observer';
import LoadingData from '@/components/common/loading-data';
import { useDebouncedValue } from '@mantine/hooks';

interface PlaylistSelectorProps {
    open: boolean;
    isMultiSelect?: boolean;
    selectedPlaylistOld?: Playlist[];
    onClose: () => void;
    onSelect: (playlists: Playlist[]) => void;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ open, isMultiSelect = false, selectedPlaylistOld, onClose, onSelect }) => {
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist[]>(selectedPlaylistOld || []);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchQuery, 500);
    const { editWebsite } = useEditorStore();

    useEffect(() => {
        setSelectedPlaylist(selectedPlaylistOld || []);
    }, [selectedPlaylistOld]);

    const handleSelect = () => {
        if (selectedPlaylist.length > 0) {
            onSelect(selectedPlaylist);
            handleClose();
        }
    };

    useEffect(() => {
        if (open) {
            setPage(1);
            setHasMore(true);
            fetchPlaylistsBySearch(1);
        }
    }, [debouncedSearch, open]);

    const handleClose = () => {
        setPage(1);
        setPlaylists([]);
        setHasMore(true);
        setSearchQuery('');
        setSelectedPlaylist([]);
        onClose();
    };

    // 加载更多数据
    const loadMore = () => {
        if (!loadingData && hasMore) {
            fetchPlaylistsBySearch(page + 1);
        }
    };

    /**
     * Search playlists based on query
     */
    const fetchPlaylistsBySearch = async (currentPage: number) => {
        if (loadingData) return;
        
        setLoadingData(true);
        try {
            const res = await PlaylistApi.search({
                page: currentPage,
                pageSize,
                siteId: editWebsite?.id as string,
                orderType: 1,
                status: 2,
                keyword: debouncedSearch, // 使用 debouncedSearch 而不是 searchQuery
            });

            if (res.code !== 0) {
                setHasMore(false);
                return;
            }

            const playlistIds = res.data.items || [];
            if (playlistIds.length === 0) {
                setHasMore(false);
                return;
            }

            const resD = await PlaylistApi.batchGet(playlistIds.join(','));
            if (resD.code !== 0) {
                setHasMore(false);
                return;
            }

            const newPlaylists = playlistIds.map((id: string) => {
                return resD.data.items.find((item: any) => item.playlistId === id)!;
            }).filter(Boolean);

            setPlaylists(prev => currentPage === 1 ? newPlaylists : [...prev, ...newPlaylists]);
            setPage(currentPage);
            setHasMore(res.data.hasMore);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
            setHasMore(false);
        } finally {
            setLoadingData(false);
        }
    };
    if (!open) return null;

    const handleClickPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(prev => {
            const isAlreadySelected = prev.some(p => p.playlistId === playlist.playlistId);
            if (isMultiSelect) {
                if (isAlreadySelected) {
                    return prev.filter(p => p.playlistId !== playlist.playlistId);
                } else {
                    return [...prev, playlist];
                }
            } else {
                if (isAlreadySelected) {
                    return [];
                } else {
                    return [playlist];
                }
            }
        });
    };
    
    return (
        <div className="fixed inset-0 z-50 flex">
            {/* 遮罩 */}
            <div className="flex-1 bg-black/30" onClick={handleClose}></div>
            {/* 侧边栏内容 */}
            <div className="w-[480px] h-full bg-white shadow-xl flex flex-col">
                {/* 顶部 */}
                <div className="flex items-center gap-2 px-4 py-4 border-b">
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded">
                        <IconArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Add Playlist to Section</h2>
                    <div className="ml-auto text-sm text-gray-500">
                        {selectedPlaylist.length}/{playlists.length}
                    </div>
                </div>
                <TextInput
                        className="p-4"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        placeholder="Search playlist"
                        leftSection={<IconSearch size={16} />}
                        variant="filled"
                />
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {playlists.map(playlist => (
                            <div
                                key={playlist.playlistId}
                                className={`relative bg-gray-50 rounded-lg p-2 h-[200px] shadow-md cursor-pointer`}
                                onClick={() => handleClickPlaylist(playlist)}
                            >
                                <div className="absolute top-2 left-2 z-10">
                                    <Checkbox
                                        checked={selectedPlaylist.map(p => p.playlistId).includes(playlist.playlistId)}
                                    />
                                </div>
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 rounded-md overflow-hidden mb-2">
                                            {playlist.cover && <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" loading="lazy" />}
                                        </div>
                                        <div className="absolute text-sm bottom-8 left-0 right-0 p-2">{playlist.videoCount} videos</div>
                                        <div className="absolute text-sm bottom-0 left-0 right-0 bg-white p-2 rounded-b-md">
                                            <div className="text-black-purple line-clamp-1 text-ellipsis">{playlist.title}</div>
                                        </div>
                            </div>
                        ))}

                        {/* InView 组件用于检测滚动到底部 */}
                        <InView
                            as="div"
                            onChange={(inView) => {
                                if (inView) {
                                    loadMore();
                                }
                            }}
                            className="col-span-2 h-10 flex justify-center"
                        >
                            {loadingData && <LoadingData className="w-10 h-10" />}
                        </InView>
                    </div>
                </div>
                {/* 底部按钮 */}
                <div className="p-6 border-t">
                    <button
                        className={`w-full py-2 rounded transition-colors ${
                            selectedPlaylist.length > 0
                                ? 'bg-primary text-white hover:bg-primary-hover'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                        onClick={handleSelect}
                        disabled={selectedPlaylist.length === 0}
                    >
                        Add to Section
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistSelector;
