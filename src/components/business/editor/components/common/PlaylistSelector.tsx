/* eslint-disable @next/next/no-img-element */
import PlaylistApi from '@/api/playlist';
import LoadingData from '@/components/common/loading-data';
import Search from '@/components/common/search';
import { Playlist } from '@/types/playlist';
import { Button, Checkbox, Pagination } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
/**
 * Props interface for PlaylistSelector component
 */
interface PlaylistSelectorProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when playlists are added to site */
    onAdd: (selectedItems: Playlist[]) => void;
    siteId: string;
    /** Currently selected playlists (optional) */
    selectedPlaylists?: Playlist[];
}

/**
 * Modal component for adding playlists to a website
 * Provides search, selection, and pagination functionality
 * @returns React component with playlist selection interface
 */
const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ isOpen, onClose, onAdd, siteId, selectedPlaylists = [] }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<Playlist[]>([]);
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
    const [activePage, setActivePage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(9);
    const [orderType, setOrderType] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [total, setTotal] = React.useState(0);
    const router = useRouter();
    const [newSelectedItems, setNewSelectedItems] = React.useState<Playlist[]>([]);

    // Sync selected playlists when modal opens
    useEffect(() => {
        if (isOpen && selectedPlaylists) {
            setSelectedItems(selectedPlaylists);
            setNewSelectedItems([]);
        }
    }, [isOpen, selectedPlaylists]);

    // Fetch playlists when search parameters change
    useEffect(() => {
        searcRequest();
    }, [searchQuery, activePage, orderType, isOpen]);

    const searcRequest = async () => {
        setLoading(true);
        setPlaylists([]);
        const res = await PlaylistApi.search({
            page: activePage,
            pageSize: pageSize,
            orderType: orderType,
            keyword: searchQuery,
            status: 2,
            siteId: siteId,
        });

        setLoading(false);
        if (res.code !== 0 || (res.data.items ?? []).length === 0) return;
        setTotal(res.data.total);
        const resD = await PlaylistApi.batchGet(res.data.items.join(','));
        setLoading(true);
        if (resD.code !== 0 || (resD.data.items ?? []).length === 0) return;
        const newPlaylists = res.data.items.map(item => resD.data.items.find(i => i.playlistId === item)).filter((item): item is Playlist => item !== null && item !== undefined);
        setPlaylists(newPlaylists);
        setLoading(false);
    };

    const isAllSelected = () => {
        return playlists.every(playlist => selectedItems.find(item => item.playlistId === playlist.playlistId));
    };

    const handleSelectAll = () => {
        if (isAllSelected()) {
            // 取消全选：从两个数组中移除当前页的所有项
            const currentPagePlaylistIds = playlists.map(playlist => playlist.playlistId);
            setSelectedItems(selectedItems.filter(item => !currentPagePlaylistIds.includes(item.playlistId)));
            setNewSelectedItems(newSelectedItems.filter(item => !currentPagePlaylistIds.includes(item.playlistId)));
        } else {
            // 全选：按照单选逻辑，将当前页未选中的项依次添加
            const itemsToAdd = playlists.filter(playlist => !selectedItems.find(item => item.playlistId === playlist.playlistId));
            setSelectedItems([...selectedItems, ...itemsToAdd]);
            setNewSelectedItems([...newSelectedItems, ...itemsToAdd]);
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
                    </div>

                    {/* Playlist Grid */}

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <LoadingData className="w-10 h-10" />
                        ) : playlists.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full gap-4">
                                <div className="text-sm font-medium text-gray-500">No content found</div>
                                <Button
                                    onClick={() => {
                                        router.push('/playlists');
                                    }}
                                >
                                    Add Playlist
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
                                {playlists.map(item => (
                                    <div
                                        key={item.playlistId}
                                        className="relative bg-gray-50 rounded-lg p-2 h-[200px] shadow-md"
                                        onClick={() => {
                                            if (selectedItems.find(i => i.playlistId === item.playlistId)) {
                                                setSelectedItems(selectedItems.filter(i => i.playlistId !== item.playlistId));
                                                setNewSelectedItems(newSelectedItems.filter(i => i.playlistId !== item.playlistId));
                                                return;
                                            }
                                            setSelectedItems([...selectedItems, item]);
                                            setNewSelectedItems([...newSelectedItems, item]);
                                        }}
                                    >
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox checked={!!selectedItems.find(i => i.playlistId === item.playlistId)} />
                                        </div>
                                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 rounded-md overflow-hidden mb-2">
                                            {item.cover &&
                                                (item.cover.toLowerCase().endsWith('.webm') ? (
                                                    <video src={item.cover} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                                ))}
                                        </div>
                                        <div className="absolute text-sm bottom-8 left-0 right-0 p-2">{item.videoCount} videos</div>
                                        <div className="absolute text-sm bottom-0 left-0 right-0 bg-white p-2 rounded-b-md">
                                            <div className="text-black-purple line-clamp-1 text-ellipsis">{item.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {playlists.length > 0 && (
                        <div className="py-4">
                            <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(total / 9)} color="primary" radius="xl" className="flex justify-center" />
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className=" bg-white border-t p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-row items-center">
                                <div className="text-sm font-medium text-gray-500">{selectedItems.length + ' Selected'}</div>
                                <Button variant="subtle" onClick={handleSelectAll}>
                                    {isAllSelected() ? 'Unselect All' : 'Select All'}
                                </Button>
                            </div>
                            <Button
                                variant="filled"
                                onClick={() => {
                                    onClose();
                                    const combined = [...newSelectedItems, ...selectedItems];
                                    // 2. 使用 Map 去重,保持第一次出现的项(即新添加的优先)
                                    const uniqueMap = new Map<string, Playlist>();
                                    combined.forEach(playlist => {
                                        if (!uniqueMap.has(playlist.playlistId)) {
                                            uniqueMap.set(playlist.playlistId, playlist);
                                        }
                                    });
                                    // 3. 转换回数组
                                    const uniquePlaylists = Array.from(uniqueMap.values());
                                    onAdd(uniquePlaylists);
                                }}
                            >
                                Add to site
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaylistSelector;
