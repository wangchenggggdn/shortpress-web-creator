'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select, Menu, Image, Pagination } from '@mantine/core';
import VideoCard from '@/components/business/videoCard';
import Search from '@/components/common/search';
import UploadButton from '@/components/common/uploadButton';
import VideoApi from '@/api/video';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoDetailEdit from '@/components/business/videoDetailEdit';
import UploadVideoModal from '@/components/business/uploadVideoModal';
import orderImage from '@/assets/images/public/order.webp';

import fileUploadStore from '@/store/useFileUploadStore';
import { toast } from 'sonner';
import CreatorApi from '@/api/creator';
import { VideoArgs } from '@/api/args';
import { IPaginationResponse, IResponse } from '@/types/public';
import profileEventBus from '@/utils/profileEventBus';

/**
 * Props interface for VideosPageView component
 */
interface VideosPageViewProps {
    searchFetch: (params: VideoArgs.Search) => Promise<IResponse<IPaginationResponse<IVideo>>>;
    deleteVideo: (id: string) => void;
    setUploadModalOpened: (opened: boolean) => void;
    setEditingVideo: (video: IVideo | null) => void;
    onUpload?: (items: IVideo[]) => void;
    addVideos?: () => void;
    uploadModalOpened?: boolean;
    editingVideo?: IVideo | null;
    playlistId?: string;
}

/**
 * Video page view component
 * Manages video listing, uploading, editing, and deletion with search and filtering capabilities
 * @returns React component with video management interface
 */
const VideosPageView = ({
    onUpload,
    uploadModalOpened = false,
    editingVideo,
    playlistId,
    setUploadModalOpened,
    setEditingVideo,
    searchFetch,
    deleteVideo,
    addVideos,
}: VideosPageViewProps) => {
    const { uploadFileList, setUploadFileList, setOpenUploadProgressModal } = fileUploadStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState<string | null>('-1');
    const [sortType, setSortType] = useState<number>(1);
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [replaceLoading, setReplaceLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [total, setTotal] = useState(0);
    const uploadFileListRef = useRef<IVideo[] | null>();
    const isCheckingRef = useRef(false);

    // Fetch video data and set up event listeners
    useEffect(() => {
        fetchVideos({ func: uploadVideo });
        profileEventBus.on('addVideo', reloadVideos);
    }, []);

    // Search videos when filters change
    useEffect(() => {
        console.log('sortType:', sortType);
        searchVideos();
    }, [status, sortType, searchQuery, activePage]);

    // Update upload file list reference
    useEffect(() => {
        uploadFileListRef.current = uploadFileList;
    }, [uploadFileList]);

    /**
     * Fetch videos from API based on search parameters
     * @param params Search parameters including upload status and callback function
     */
    const fetchVideos = async ({ uploadStatus, func }: { uploadStatus?: string; func?: (items: IVideo[]) => void }) => {
        setLoading(true);
        const params: VideoArgs.Search = {
            keyword: searchQuery,
            page: activePage,
            uploadStatus: uploadStatus,
            pageSize: getItemsPerPage(),
            status: Number(status),
            orderType: sortType,
        };
        playlistId && (params.playlistId = playlistId);
        const res = await searchFetch(params);
        if (res.code === 0) {
            setTotal(res.data.total);
            setVideos(res.data.items);
        }
        setLoading(false);
    };

    /**
     * Check upload status for a list of videos
     * @param vids Array of video IDs to check
     */
    const checkUploadStatusR = async (vids: string[]) => {
        if (vids.length === 0) return;
        const res = await VideoApi.batchGet(vids.join(','));
        if (res.code === 0) {
            // Update upload status for each video in the list
            const newItems = (uploadFileListRef.current ?? []).map(item => {
                const newItem = (res.data.items ?? []).find(oldItem => oldItem.vid === item.vid);
                return { ...item, uploadStatus: newItem?.uploadStatus ?? VideoUploadStatus.NOT_UPLOADED };
            });
            setUploadFileList(newItems);
            if (!(newItems ?? []).some(item => item.uploadStatus === VideoUploadStatus.UPLOADING || item.uploadStatus === VideoUploadStatus.NOT_UPLOADED)) {
                searchVideos();
                isCheckingRef.current = false;
            }
        }
    };

    /**
     * Search videos based on current filters
     */
    const searchVideos = async () => {
        setLoading(true);
        const params: VideoArgs.Search = { keyword: searchQuery, status: Number(status), orderType: sortType, page: activePage, pageSize: getItemsPerPage() };
        const res = await searchFetch(params);
        if (res.code === 0) {
            setTotal(res.data.total);
            setVideos(res.data.items);
        }
        setLoading(false);
    };

    /**
     * Reload video list
     */
    const reloadVideos = () => {
        searchVideos();
    };

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
     * Update videos state with uploaded items
     * @param items Array of uploaded videos
     */
    const uploadVideo = (items: IVideo[]) => {
        setVideos(items);
    };

    /**
     * Handle search input changes
     * @param value Search query string
     */
    const handleSearch = useCallback((value: string) => {
        setSearchQuery(value);
        setActivePage(1);
    }, []);

    /**
     * Open upload progress modal
     * @param items Array of videos being uploaded
     */
    const openUploadProgressModal = (items: IVideo[]) => {
        setUploadFileList(items);
        setOpenUploadProgressModal(items.length !== 0);
    };

    /**
     * Handle file upload
     * @param files Array of files to upload
     */
    const handleUpload = async (files: File[]) => {
        if (files.length === 0) {
            return;
        }
        let uploadFileListN: IVideo[] = (uploadFileListRef.current ?? []).concat(initUploadFileList(files));

        setOpenUploadProgressModal(true);
        setUploadFileList(uploadFileListN);
        uploadRes(files);
        checkUploadStatus();
    };

    /**
     * Upload files to server
     * @param files Array of files to upload
     */
    const uploadRes = (files: File[]) => {
        if (files.length > 0) {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            VideoApi.upload(formData).then(res => {
                const videos = reloadUploadFileList(res.data.vids);
                setUploadFileList(videos);
            });
        }
    };

    /**
     * Check upload status periodically
     */
    const checkUploadStatus = async () => {
        if (!isCheckingRef.current) {
            isCheckingRef.current = true;
            while (isCheckingRef.current) {
                const vids = uploadFileListRef.current?.map(item => item.vid) ?? [];
                const isHaveVids = vids.some(item => item !== '');
                console.log('vids:', vids, 'isHaveVids:', isHaveVids);
                isHaveVids && (await checkUploadStatusR(vids));
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    };

    /**
     * Initialize upload file list from files
     * @param files Array of files to initialize from
     * @returns Array of video objects
     */
    const initUploadFileList = (files: File[]): IVideo[] => {
        const items: IVideo[] = files.map(file => ({
            vid: '',
            title: file.name,
            uploadStatus: VideoUploadStatus.NOT_UPLOADED,
            status: 0,
            creatorId: '',
            createdAt: 0,
            updatedAt: 0,
        }));
        return items;
    };

    /**
     * Reload upload file list with video IDs
     * @param vids Array of video IDs
     * @returns Updated array of video objects
     */
    const reloadUploadFileList = (vids: string[]): IVideo[] => {
        for (let index = 0; index < (uploadFileListRef.current ?? []).length; index++) {
            const element = (uploadFileListRef.current ?? [])[index];
            if (element.vid === '') {
                element.vid = vids[0] ?? '';
                if (vids.length > 0) {
                    vids.splice(0, 1);
                }
            }
        }
        return uploadFileListRef.current ?? [];
    };

    /**
     * Open upload modal
     */
    const handleOpenUploadModal = () => {
        setUploadModalOpened(true);
    };

    /**
     * Handle video edit action
     * @param id Video ID to edit
     */
    const handleEdit = useCallback(
        (id: string) => {
            const video = videos.find(v => v.vid === id);
            if (video) {
                setEditingVideo(video);
            }
        },
        [videos]
    );

    /**
     * Handle video save action
     * @param videoData Video data to save
     * @param coverFile Optional cover image file
     */
    const handleSave = async (videoData: VideoArgs.Modify, coverFile?: File) => {
        setSaveLoading(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                videoData.cover = res.data ?? '';
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

    /**
     * Handle video file replacement
     * @param videoFile New video file to replace existing one
     */
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

    /**
     * Handle video deletion
     * @param id Video ID to delete
     */
    const handleDelete = (id: string) => {
        const video = videos.find(v => v.vid === id);
        if (video) {
            setVideos(videos.filter(v => v.vid !== id));
            deleteVideo(id);
        }
    };

    /**
     * Handle video link copy
     * @param id Video ID to copy link for
     */
    const handleCopyLink = (id: string) => {
        const video = videos.find(v => v.vid === id);
        if (video) {
            navigator.clipboard.writeText(video.videoSourceUrl ?? '');
            toast.success('Link copied to clipboard');
        }
    };

    return (
        <>
            {/* 搜索栏 */}
            <div className="px-11 py-4 grid grid-cols-4">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{total} videos</span>
                </div>

                {/* Search Input */}
                <div className="col-span-2 flex justify-center items-center">
                    <Search className="w-80" value={searchQuery} onChange={handleSearch} placeholder="Search video" />
                </div>

                {/* Filter Controls */}
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
                            <Menu.Item onClick={() => setSortType(1)}>Title</Menu.Item>
                            <Menu.Item onClick={() => setSortType(0)}>Upload time</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </div>

            {/* Video Grid Container */}
            <div className="flex-1 px-6 pb-6 min-h-0">
                <div className="h-full p-2 flex flex-col bg-layout rounded-lg">
                    <div className="flex-1 min-h-0 ">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <span>Loading...</span>
                            </div>
                        ) : videos.length > 0 ? (
                            <div className="h-full overflow-y-auto">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-4">
                                    {videos.map(video => (
                                        <VideoCard key={video.vid} {...video} onEdit={handleEdit} onDelete={handleDelete} onCopyLink={handleCopyLink} onClick={handleEdit} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 mb-4">No videos available</p>
                                <UploadButton text={playlistId ? 'Add Videos' : undefined} onClick={playlistId ? addVideos : handleOpenUploadModal} />
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
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

            {/* edit modal */}
            {editingVideo && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setEditingVideo(null)} />
                    <div className="fixed top-0 right-0 flex h-screen z-50">
                        <VideoDetailEdit
                            isReplace={replaceLoading}
                            video={editingVideo}
                            onClose={() => setEditingVideo(null)}
                            onSave={handleSave}
                            onDelete={video => {
                                handleDelete(video.vid);
                            }}
                            onReplace={handleReplace}
                            isUploading={saveLoading}
                        />
                    </div>
                </>
            )}

            {/* upload modal */}
            <UploadVideoModal opened={uploadModalOpened} onClose={() => setUploadModalOpened(false)} onUpload={handleUpload} />
        </>
    );
};

export default VideosPageView;
