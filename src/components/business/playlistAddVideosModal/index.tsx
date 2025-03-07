import React, { useEffect, useRef, useState } from 'react';
import { Button, Pagination } from '@mantine/core';
import Search from '@/components/common/search';
import { IconX } from '@tabler/icons-react';
import { IVideo } from '@/types/video';
import VideoApi from '@/api/video';

/**
 * Props interface for AddContentModal component
 */
interface AddContentModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when videos are added to playlist */
    onAdd: (selectedItems: string[]) => void;
}

/**
 * Modal component for adding videos to a playlist
 * Provides search, selection, and pagination functionality
 * @returns React component with video selection interface
 */
const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [videoList, setVideoList] = useState<IVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [orderType, setOrderType] = useState(0);
    const [total, setTotal] = useState(0);
    const currentPage = useRef(1);

    console.log('activePage111;', activePage);
    useEffect(() => {
        console.log('activePage;', activePage);
        VideoApi.search({
            keyword: searchQuery,
            page: activePage,
            pageSize: pageSize,
            orderType: orderType,
        }).then(res => {
            setVideoList(res.data.items);
            setTotal(res.data.total);
        });
    }, [searchQuery, activePage, orderType]);

    useEffect(() => {
        currentPage.current = activePage;
    }, [activePage]);

    useEffect(() => {
        if (isOpen) {
            setSelectedItems([]);
            setActivePage(1);
        }
    }, [isOpen]);

    const isAllSelected = () => {
        return videoList.every(video => selectedItems.includes(video.vid));
    };

    const handleSelectAll = () => {
        if (isAllSelected()) {
            const currentPageVideoIds = videoList.map(video => video.vid);
            setSelectedItems(selectedItems.filter(id => !currentPageVideoIds.includes(id)));
        } else {
            const newSelectedItems = new Set([...selectedItems, ...videoList.map(video => video.vid)]);
            setSelectedItems(Array.from(newSelectedItems));
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setActivePage(1);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-lg z-50 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center my-3 px-4">
                        <h2 className="text-xl text-black-purple font-semibold">Add Videos to Playlist</h2>
                        <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                            <IconX size={20} />
                        </Button>
                    </div>

                    <div className="mb-6 px-4 flex flex-row items-center gap-4">
                        <div className="flex-1">
                            <Search value={searchQuery} onChange={handleSearch} placeholder="Search Videos" className="w-full" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {videoList.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-sm font-medium text-gray-500">No content found</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
                                {videoList.map(item => (
                                    <div key={item.vid} className="relative bg-gray-50 rounded-lg p-2 h-[200px] shadow-md">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.vid)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setSelectedItems([...selectedItems, item.vid]);
                                                } else {
                                                    setSelectedItems(selectedItems.filter(id => id !== item.vid));
                                                }
                                            }}
                                            className="absolute top-2 left-2 z-10"
                                        />
                                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-200 rounded-md overflow-hidden mb-2">
                                            {item.cover && <img src={item.cover} alt={item.title} className="w-full h-full object-cover" loading="lazy" />}
                                        </div>
                                        <div className="absolute text-sm bottom-0 left-0 right-0 h-14 bg-white p-2 rounded-b-md">
                                            <div className="text-black-purple line-clamp-2 text-ellipsis">{item.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {videoList.length > 0 && (
                        <div className="py-4 w-full px-4">
                            <Pagination value={activePage} onChange={setActivePage} total={Math.ceil(total / 30)} color="primary" radius="xl" className="flex justify-center" />
                        </div>
                    )}

                    <div className="w-full p-4 bg-white border-t">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-row items-center justify-center">
                                <div className="text-sm font-medium text-gray-500">{selectedItems.length + ' Selected'}</div>
                                <Button variant="subtle" onClick={handleSelectAll}>
                                    {isAllSelected() ? 'Unselect All' : 'Select All'}
                                </Button>
                            </div>
                            <Button variant="filled" onClick={() => onAdd(selectedItems)}>
                                Add to Playlist
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddContentModal;
