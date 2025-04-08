'use client';

import React, { useState, useCallback } from 'react';
import Header from '@/components/system/header';
import UploadButton from '@/components/common/upload-button';
import VideoApi from '@/api/video';
import { IVideo } from '@/types/video';
import { VideoArgs } from '@/api/args';
import VideosPageView from '@/components/business/videos/video-page-view';
import { toast } from 'sonner';
import fileUploadStore from '@/store/useFileUploadStore';

interface VideosPageProps {}

/**
 * Videos management page component
 * Handles video listing, uploading, editing, and deletion
 * @returns React component with video management interface
 */
const VideosPage: React.FC<VideosPageProps> = () => {
    const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
    const [uploadModalOpened, setUploadModalOpened] = useState(false);
    const { setPlaylistId, setMaxLimit } = fileUploadStore();

    /**
     * Search videos based on provided parameters
     * @param params Search parameters for filtering videos
     * @returns Promise with search results
     */
    const searchFetch = async (params: VideoArgs.Search) => {
        const res = await VideoApi.search(params);
        if (res.code !== 0 || (res.data.items ?? []).length === 0) return null;
        const resD = await VideoApi.batchGet(res.data.items.join(','));

        if (resD.code !== 0 || (resD.data.items ?? []).length === 0) return null;
        const items = res.data.items.map((item: string) => {
            const video = resD.data.items.find((video: IVideo) => video.vid === item);
            if (video) return video;
        });
        resD.data.items = items as IVideo[];
        resD.data.total = res.data.total;
        resD.data.page = res.data.page;
        resD.data.pageSize = res.data.pageSize;
        resD.data.hasMore = res.data.hasMore;
        return resD;
    };

    /**
     * Delete a video by ID
     * @param id Video ID to delete
     * @returns Promise
     */
    const deleteVideo = async (id: string) => {
        VideoApi.delete([id]).then(() => {
            toast.success('Video deleted successfully');
        });
    };

    /**
     * Open the video upload modal
     */
    const handleOpenUploadModal = useCallback(() => {
        setUploadModalOpened(true);
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Header>
                <UploadButton onClick={handleOpenUploadModal} />
            </Header>

            <VideosPageView
                uploadModalOpened={uploadModalOpened}
                editingVideo={editingVideo}
                setUploadModalOpened={opened => {
                    setPlaylistId(null);
                    setMaxLimit(100000);
                    setUploadModalOpened(opened);
                }}
                setEditingVideo={setEditingVideo}
                searchFetch={searchFetch}
                deleteVideo={deleteVideo}
            ></VideosPageView>
        </div>
    );
};

export default VideosPage;
