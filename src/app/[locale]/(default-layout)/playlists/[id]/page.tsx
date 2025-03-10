'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/system/header';
import PlaylistDetailEdit from '@/components/business/playlistDetailEdit';
import { IVideo } from '@/types/video';
import { Playlist } from '@/types/playlist';
import PlaylistApi from '@/api/playlist';
import { toast } from 'sonner';
import { PlaylistArgs, VideoArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import AddContentModal from '@/components/business/playlistAddVideosModal';
import VideoApi from '@/api/video';
import VideosPageView from '@/components/business/videoPageView';
import profileEventBus from '@/utils/profileEventBus';

/**
 * Playlist detail page component
 * Displays playlist information and manages its videos
 * @returns React component with playlist detail view
 */
const PlaylistVideosPage = () => {
    const paramsP = useParams();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
    const [uploadModalOpened, setUploadModalOpened] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch playlist data when ID changes
    useEffect(() => {
        playlistFetch();
    }, [paramsP.id]);

    /**
     * Search videos in the playlist
     * @param params Search parameters
     * @returns Promise with search results
     */
    const searchFetch = async (params: VideoArgs.Search) => {
        params.playlistId = paramsP.id as string;
        const res = await VideoApi.search(params);
        const videos = await VideoApi.batchGet(res.data.items.join(','));
        return videos;
    };

    /**
     * Fetch playlist data from API
     */
    const playlistFetch = async () => {
        const res = await PlaylistApi.get(paramsP.id as string);
        setPlaylist(res.data);
    };

    /**
     * Handle playlist save action
     * @param playlistData Playlist data to save
     * @param coverFile Optional cover image file
     */
    const handleSavePlaylist = async (playlistData: PlaylistArgs.Modify, coverFile?: File) => {
        setIsSaving(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile ?? '');
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                playlistData.cover = res.data;
            }
        }

        PlaylistApi.modify(playlistData).then(res => {
            if (res.code === 0) {
                playlistFetch();
                setIsEditing(false);
            }
        });
        setIsSaving(false);
    };

    /**
     * Handle adding videos to playlist
     * @param selectedItems Array of video IDs to add
     */
    const handleAddContent = (selectedItems: string[]) => {
        PlaylistApi.addVideos(paramsP.id as string, selectedItems).then(res => {
            if (res.code === 0) {
                setIsAddContentOpen(false);
                playlistFetch();
                // Notify about added videos
                profileEventBus.emit('addVideo', selectedItems);
                toast.success('add videos success');
            } else {
                toast.error(res.info);
            }
        });
    };

    /**
     * Open add videos modal
     */
    const handleAddVideos = () => {
        setIsAddContentOpen(true);
    };

    /**
     * Handle video deletion from playlist
     * @param id Video ID to delete
     */
    const handleDeleteVideo = (id: string) => {
        PlaylistApi.removeVideos(paramsP.id as string, [id]);
        toast.success('Video removed from playlist');
        setEditingVideo(null);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                customTitle={
                    <div className="flex items-center gap-4">
                        <Link href="/playlists" className="text-gray-600 hover:text-gray-900">
                            <IconArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-medium">{playlist?.title}</h1>
                        <Button variant="subtle" color="primary" onClick={() => setIsEditing(true)}>
                            Edit Detail
                        </Button>
                    </div>
                }
            >
                <Button leftSection={<IconPlus size={16} />} variant="filled" color="primary" onClick={() => setIsAddContentOpen(true)}>
                    Add Videos
                </Button>
            </Header>

            <VideosPageView
                uploadModalOpened={uploadModalOpened}
                editingVideo={editingVideo}
                setUploadModalOpened={setUploadModalOpened}
                setEditingVideo={setEditingVideo}
                searchFetch={searchFetch}
                deleteVideo={handleDeleteVideo}
                addVideos={handleAddVideos}
                playlistId={paramsP.id as string}
            ></VideosPageView>

            {/* Add Videos Modal */}
            <AddContentModal isOpen={isAddContentOpen} onClose={() => setIsAddContentOpen(false)} onAdd={handleAddContent} />

            {/* Edit Modal */}
            {isEditing && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setIsEditing(false)} />
                    <div className="fixed top-0 right-0 z-50">
                        <PlaylistDetailEdit isLoading={isSaving} playlistOld={playlist ?? undefined} onClose={() => setIsEditing(false)} onSave={handleSavePlaylist} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PlaylistVideosPage;
