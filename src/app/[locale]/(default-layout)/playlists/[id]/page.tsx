'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft, IconPlus, IconArrowsUpDown, IconEdit } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/system/header';
import PlaylistDetailEdit from '@/components/business/playlistDetailEdit';
import { IVideo } from '@/types/video';
import { Playlist, PlaylistVideoOrder } from '@/types/playlist';
import PlaylistApi from '@/api/playlist';
import { toast } from 'sonner';
import { PlaylistArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import AddContentModal from '@/components/business/playlistAddVideosModal';
import VideoApi from '@/api/video';
import PlaylistVideoItem from '@/components/business/playlistVideoItem';
import userStore from '@/store/useUserStore';
import { GuideName } from '@/types/guide';

const PlaylistVideosPage = () => {
    const paramsP = useParams();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const orderParamCurrentRef = useRef<PlaylistVideoOrder | null>();
    const { userInfo } = userStore();
    const videosRef = useRef<IVideo[]>([]);

    useEffect(() => {
        playlistFetch();
        fetchVideos();
    }, [paramsP.id]);

    useEffect(() => {
        console.log('videos:', videos);
        videosRef.current = videos;
    }, [videos]);

    const fetchVideos = async () => {
        const res = await PlaylistApi.videoOrder(paramsP.id as string);
        if (res.code !== 0 || (res.data.sortData.vids ?? []).length === 0) return;
        orderParamCurrentRef.current = res.data;
        const videoIds = res.data.sortData.vids;
        const batchSize = 20;
        const batches = [];

        const totalBatches = Math.ceil(videoIds.length / batchSize);
        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, videoIds.length);
            const batch = videoIds.slice(start, end);
            batches.push(VideoApi.batchGet(batch.join(',')));
        }

        try {
            const results = await Promise.all(batches);
            const videoMap = results.reduce(
                (acc, result) => {
                    if (result.code === 0) {
                        (result.data.items ?? []).forEach(video => {
                            acc[video.vid] = video;
                        });
                    }
                    return acc;
                },
                {} as { [key: string]: IVideo }
            );

            const orderedVideos = videoIds.map(vid => videoMap[vid]).filter(Boolean);
            setVideos(orderedVideos);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        }
    };

    const playlistFetch = async () => {
        const res = await PlaylistApi.get(paramsP.id as string);
        setPlaylist(res.data);
    };

    const handleSavePlaylist = async (playlistData: PlaylistArgs.Modify, website?: string, coverFile?: File) => {
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
                toast.success('Playlist updated successfully');
                playlistFetch();
                setIsEditing(false);
            }
        });
        setIsSaving(false);
    };

    const handleAddContent = (selectedItems: string[]) => {
        PlaylistApi.addVideos(paramsP.id as string, selectedItems).then(res => {
            if (res.code === 0) {
                if (userInfo?.guides.find(item => item.name === GuideName.AddVideoToPlaylist)?.status !== 1) {
                    CreatorApi.completeGuides({ guides: [GuideName.AddVideoToPlaylist] });
                }
                setIsAddContentOpen(false);
                fetchVideos();
                toast.success('Videos added successfully');
            } else {
                toast.error(res.info);
            }
        });
    };

    const handleDeleteVideo = (id: string) => {
        PlaylistApi.removeVideos(paramsP.id as string, [id]).then(res => {
            if (res.code === 0) {
                fetchVideos();
                toast.success('Video removed from playlist');
            } else {
                toast.error(res.info);
            }
        });
    };

    const handleOrderChange = (oldIndex: number, newIndex: number) => {
        const newVideos = [...videos];
        const [movedItem] = newVideos.splice(oldIndex, 1);
        newVideos.splice(newIndex, 0, movedItem);
        setVideos(newVideos);
    };

    const handleIndexChange = (oldIndex: number, newIndex: number) => {
        console.log('handleIndexChange', oldIndex, newIndex);
        const targetIndex = newIndex - 1;
        let finalIndex;
        if (targetIndex <= 0) {
            finalIndex = 0;
        } else if (targetIndex >= videos.length) {
            finalIndex = videos.length - 1;
        } else {
            finalIndex = targetIndex;
        }
        const newVideos = [...videos];
        const [movedItem] = newVideos.splice(oldIndex, 1);
        const newVideos0 = newVideos.splice(finalIndex, 0, movedItem);
        const updatedVideos = newVideos.map((video, index) => ({
            ...video,
            index: index + 1,
        }));
        const sortedVideos = [...updatedVideos].sort((a, b) => a.index - b.index);
        setVideos(sortedVideos);
    };

    const handleSaveOrder = () => {
        if (orderParamCurrentRef.current === null) return;
        const videoIds = videosRef.current.map(video => video.vid);
        orderParamCurrentRef.current!.sortData.vids = videoIds;
        PlaylistApi.updateVideosOrder(orderParamCurrentRef.current!).then(res => {
            if (res.code === 0) {
                toast.success('Video order updated successfully');
                setIsEditingOrder(false);
            } else {
                toast.error('Failed to update video order');
                fetchVideos();
            }
        });
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
                    </div>
                }
            >
                <div className="flex gap-2">
                    <Button variant="subtle" color="primary" onClick={() => setIsEditing(true)}>
                        Edit Detail
                    </Button>
                    <Button leftSection={<IconPlus size={16} />} variant="filled" color="primary" onClick={() => setIsAddContentOpen(true)}>
                        Add Videos
                    </Button>
                </div>
            </Header>

            <div className="px-6 pt-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{videos.length} videos</span>
                </div>
                <div className="flex">
                    <Button variant="subtle" color={isEditingOrder ? 'red' : 'primary'} onClick={() => (isEditingOrder ? handleSaveOrder() : setIsEditingOrder(true))} px={'sm'}>
                        {isEditingOrder ? 'Save Order' : 'Edit Order'}
                    </Button>
                    {isEditingOrder && (
                        <Button
                            variant="subtle"
                            color="primary"
                            onClick={() => {
                                setIsEditingOrder(false);
                                fetchVideos();
                            }}
                            px={'sm'}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <div className="max-w-full mx-auto p-6">
                    <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-180px)] overflow-y-auto">
                        {videos.map((video, index) => (
                            <PlaylistVideoItem
                                key={video.vid}
                                video={video}
                                index={index}
                                isEditing={isEditingOrder}
                                onEdit={setEditingVideo}
                                onDelete={handleDeleteVideo}
                                onOrderChange={handleOrderChange}
                                onIndexChange={handleIndexChange}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <AddContentModal isOpen={isAddContentOpen} onClose={() => setIsAddContentOpen(false)} onAdd={handleAddContent} />

            {isEditing && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setIsEditing(false)} />
                    <div className="fixed top-0 right-0 z-50">
                        <PlaylistDetailEdit isLoading={isSaving} playlistOld={playlist ?? undefined} onClose={() => setIsEditing(false)} onSave={handleSavePlaylist} />
                    </div>
                </>
            )}

            {editingVideo && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setEditingVideo(null)} />
                    <div className="fixed top-0 right-0 z-50">
                        <PlaylistDetailEdit
                            isLoading={isSaving}
                            playlistOld={editingVideo as any}
                            onClose={() => setEditingVideo(null)}
                            onSave={data => {
                                // Handle video edit save
                                VideoApi.modify({
                                    ...data,
                                    vid: editingVideo.vid,
                                }).then(res => {
                                    if (res.code === 0) {
                                        fetchVideos();
                                        setEditingVideo(null);
                                        toast.success('Video updated successfully');
                                    } else {
                                        toast.error(res.info);
                                    }
                                });
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default PlaylistVideosPage;
