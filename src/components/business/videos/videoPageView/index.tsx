'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select, Menu, Image, Pagination } from '@mantine/core';
import VideoCard from '@/components/business/videos/videoCard';
import Search from '@/components/common/search';
import UploadButton from '@/components/common/uploadButton';
import VideoApi from '@/api/video';
import { IVideo } from '@/types/video';
import VideoDetailEdit from '@/components/business/videos/videoDetailEdit';
import UploadVideoModal from '@/components/business/uploadVideoModal';
import orderImage from '@/assets/images/public/order.webp';

import { toast } from 'sonner';
import { VideoArgs } from '@/api/args';
import { IPaginationResponse, IResponse } from '@/types/public';
import ConfirmDialog from '@/components/common/confirmDialog';
import LoadingData from '@/components/common/loadingData';
import CreatorApi from '@/api/creator';
import { IconCheck } from '@tabler/icons-react';

interface VideosPageViewProps {
    searchFetch: (params: VideoArgs.Search) => Promise<IResponse<IPaginationResponse<IVideo>> | null>;
    deleteVideo: (id: string) => void;
    setUploadModalOpened: (opened: boolean) => void;
    setEditingVideo: (video: IVideo | null) => void;
    uploadModalOpened?: boolean;
    editingVideo?: IVideo | null;
    playlistId?: string;
}

const VideosPageView = ({ uploadModalOpened = false, editingVideo, playlistId, setUploadModalOpened, setEditingVideo, searchFetch, deleteVideo }: VideosPageViewProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<string | null>('-1');
    const [sortType, setSortType] = useState<number>(1);
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [replaceLoading, setReplaceLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const videoToDeleteRef = useRef<string | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        searchVideos();
    }, [status, sortType, searchQuery, activePage]);

    const fetchVideos = async () => {
        setLoading(true);
        const params: VideoArgs.Search = {
            keyword: searchQuery,
            page: activePage,
            pageSize: getItemsPerPage(),
            status: Number(status),
            orderType: sortType,
        };
        playlistId && (params.playlistId = playlistId);
        const res = await searchFetch(params);
        if (res?.code === 0) {
            setTotal(res?.data?.total ?? 0);
            setVideos(res?.data?.items ?? []);
        }
        setLoading(false);
    };

    const searchVideos = async () => {
        setLoading(true);
        const params: VideoArgs.Search = { keyword: searchQuery, status: Number(status), orderType: sortType, page: activePage, pageSize: getItemsPerPage() };
        const res = await searchFetch(params);
        if (res?.code === 0) {
            setTotal(res?.data?.total ?? 0);
            setVideos(res?.data?.items ?? []);
        }
        setLoading(false);
    };

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

    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setActivePage(1);
    }, []);

    const handleOpenUploadModal = () => {
        setUploadModalOpened(true);
    };

    const handleEdit = useCallback(
        (id: string) => {
            const video = videos.find(v => v.vid === id);
            if (video) {
                setEditingVideo(video);
            }
        },
        [videos]
    );

    const handleSave = async (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => {
        setSaveLoading(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                videoData.cover = res.data ?? '';
            }
        }
        if (videoFile) {
            const formData = new FormData();
            formData.append('file', videoFile);
            const replaceRes = await VideoApi.replace({ vid: editingVideo?.vid ?? '', formData });
            if (replaceRes.code === 0) {
                videoData.videoPath = replaceRes.data.videoSourceUrl ?? '';
                videoData.videoSourceUrl = replaceRes.data.videoSourceUrl ?? '';
            }
        }
        const res = await VideoApi.modify(videoData);
        if (res.code === 0) {
            toast.success('Video saved successfully');
            setVideos(
                videos.map(v =>
                    v.vid === videoData.vid
                        ? {
                              ...v,
                              ...videoData,
                          }
                        : v
                )
            );
        }
        setEditingVideo(null);
        setSaveLoading(false);
    };

    const handleReplace = async (videoFile: File | undefined) => {
        if (!videoFile) return;
        setReplaceLoading(true);
        if (videoFile) {
            const formData = new FormData();
            formData.append('file', videoFile);
            const replaceRes = await VideoApi.replace({ vid: editingVideo?.vid ?? '', formData });

            if (replaceRes.code === 0) {
                setVideos(videos.map(v => (v.vid === editingVideo?.vid ? { ...v, ...replaceRes.data } : v)));
                const newVideo = videos.find(v => v.vid === editingVideo?.vid);
                newVideo && setEditingVideo({ ...newVideo, ...replaceRes.data });
                toast.success('Video replaced successfully');
            }
        }
        setReplaceLoading(false);
    };

    const handleDeleteClick = (id: string) => {
        videoToDeleteRef.current = id;
        if (playlistId) {
            handleConfirmDelete();
            return;
        }
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        const id = videoToDeleteRef.current;
        if (!id) return;

        const video = videos.find(v => v.vid === id);
        if (video) {
            setVideos(videos.filter(v => v.vid !== id));
            deleteVideo(id);
            setEditingVideo(null);
            setTotal(total - 1);
        }
        setDeleteModalOpen(false);
        videoToDeleteRef.current = null;
    };

    const handleCopyLink = (id: string) => {
        const video = videos.find(v => v.vid === id);
        if (video) {
            navigator.clipboard.writeText(video.videoSourceUrl ?? '');
            toast.success('Link copied to clipboard');
        }
    };

    return (
        <>
            <div className="px-11 py-4 grid grid-cols-4">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{total} videos</span>
                </div>

                <div className="col-span-2 flex justify-center items-center">
                    <Search className="w-80" value={searchQuery} onChange={handleSearch} placeholder="Search video" />
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Select
                        value={status}
                        onChange={setStatus}
                        data={[
                            { value: '-1', label: 'All' },
                            { value: '2', label: 'Published' },
                            { value: '1', label: 'Unpublished' },
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
                            <Menu.Item onClick={() => setSortType(1)}>
                                <div className="flex items-center gap-2">{sortType === 1 && <IconCheck size={20} />}Title</div>
                            </Menu.Item>
                            <Menu.Item onClick={() => setSortType(0)}>
                                <div className="flex items-center gap-2">{sortType === 0 && <IconCheck size={20} />}Created time</div>
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>

            <div className="flex-1 px-6 pb-6 min-h-0">
                <div className="h-full p-2 flex flex-col bg-layout rounded-lg">
                    <div className="flex-1 min-h-0 ">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <LoadingData />
                            </div>
                        ) : videos.length > 0 ? (
                            <div className="h-full overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4">
                                    {videos.map(video => (
                                        <VideoCard
                                            deleteString={playlistId ? 'Remove' : 'Delete'}
                                            key={video.vid}
                                            {...video}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            onCopyLink={handleCopyLink}
                                            onClick={handleEdit}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : searchQuery.length > 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-black-purple text-lg mb-2">No video found</p>
                                <p className="text-gray-500 text-sm">No video with filtered condition</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 mb-4"> No content available</p>
                                <UploadButton text={playlistId ? 'Add Videos' : undefined} onClick={handleOpenUploadModal} />
                            </div>
                        )}
                    </div>

                    {videos.length > 0 && (
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

            {editingVideo && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setEditingVideo(null)} />
                    <div className="fixed top-0 right-0 flex h-screen z-50">
                        <VideoDetailEdit
                            playlistId={playlistId}
                            isReplace={replaceLoading}
                            video={editingVideo}
                            onClose={() => setEditingVideo(null)}
                            onSave={handleSave}
                            onDelete={video => {
                                handleDeleteClick(video.vid);
                            }}
                            deleteString={playlistId ? 'Remove from playlist' : 'Delete'}
                            onReplace={handleReplace}
                            isUploading={saveLoading}
                        />
                    </div>
                </>
            )}

            <UploadVideoModal opened={uploadModalOpened} onClose={() => setUploadModalOpened(false)} onUploadSuccess={fetchVideos} />

            <ConfirmDialog
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message="Are you sure you want to delete this video? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
};

export default VideosPageView;
