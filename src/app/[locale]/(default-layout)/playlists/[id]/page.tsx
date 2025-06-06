'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import Header from '@/components/system/header';
import PlaylistDetailEdit from '@/components/business/playlists/playlist-detail-edit';
import { IVideo } from '@/types/video';
import { Playlist, PlaylistVideoOrder } from '@/types/playlist';
import PlaylistApi from '@/api/playlist';
import { toast } from 'sonner';
import { PlaylistArgs, VideoArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import AddContentModal from '@/components/business/playlists/playlist-add-videos-modal';
import VideoApi from '@/api/video';
import PlaylistVideoItem from '@/components/business/playlists/playlist-video-item';
import userStore from '@/store/useUserStore';
import { GuideName } from '@/types/guide';
import AddVideoButton from '@/components/business/add-video-button';
import UploadVideoModal from '@/components/business/upload-video-modal';
import fileUploadStore from '@/store/useFileUploadStore';
import LoadingData from '@/components/common/loading-data';
import VideoDetailEdit from '@/components/business/videos/video-detail-edit';
import ConfirmDialog from '@/components/common/confirm-dialog';
import { useRouter } from 'next/navigation';
import profileEventBus from '@/utils/profileEventBus';
import { EventName } from '@/types/event';

interface PlaylistVideosPageProps {}

const PlaylistVideosPage: React.FC<PlaylistVideosPageProps> = () => {
    const paramsP = useParams();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const orderParamCurrentRef = useRef<PlaylistVideoOrder | null>();
    const { userInfo } = userStore();
    const { setPlaylistId, setMaxLimit } = fileUploadStore();
    const videosRef = useRef<IVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [replaceLoading, setReplaceLoading] = useState(false);
    const [confirmSaveOrderOpen, setConfirmSaveOrderOpen] = useState(false);
    const router = useRouter();

    const handleUploadSuccess = useCallback((lastUploadFile: IVideo) => {
        if (userInfo?.guides.find(item => item.name === GuideName.AddVideoToPlaylist)?.status !== 1) {
            CreatorApi.completeGuides({ guides: [GuideName.AddVideoToPlaylist] });
        }
        if (userInfo?.guides.find(item => item.name === GuideName.UploadVideo)?.status !== 1) {
            CreatorApi.completeGuides({ guides: [GuideName.UploadVideo] });
        }
        fetchVideos();
        setIsUploadModalOpen(false);
    }, []);

    useEffect(() => {
        profileEventBus.on(EventName.UploadVideoSuccess, handleUploadSuccess);
        return () => {
            profileEventBus.off(EventName.UploadVideoSuccess, handleUploadSuccess);
        };
    }, [handleUploadSuccess]);

    useEffect(() => {
        playlistFetch();
        const loadFetchVideo = async () => {
            setLoading(true);
            await fetchVideos();
            setLoading(false);
        };
        loadFetchVideo();
    }, [paramsP.id]);

    useEffect(() => {
        console.log('videos:', videos);
        videosRef.current = videos;
    }, [videos]);

    const fetchVideos = async () => {
        console.log('--------------------------fetchVideos:',paramsP.id);
        const res = await PlaylistApi.videoOrder(paramsP.id as string);
        orderParamCurrentRef.current = res.data;
        if (res.code !== 0 || (res.data.sortData.vids ?? []).length === 0) {
            setVideos([]);
            return;
        };
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

    const reloadEditVersion = async () => {
        const res = await PlaylistApi.videoOrder(paramsP.id as string);
        orderParamCurrentRef.current = res.data;
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

    const handleAddContent = async (selectedItems: string[]) => {
        await reloadEditVersion();

        if (userInfo?.guides.find(item => item.name === GuideName.AddVideoToPlaylist)?.status !== 1) {
            CreatorApi.completeGuides({ guides: [GuideName.AddVideoToPlaylist] });
        }
        if (orderParamCurrentRef.current !== null) {
            orderParamCurrentRef.current!.sortData.vids = [...orderParamCurrentRef.current!.sortData.vids, ...selectedItems];
        }
        await PlaylistApi.updateVideosOrder(orderParamCurrentRef.current!);
        setIsAddContentOpen(false);
        fetchVideos();
        toast.success('Videos added successfully');
    };

    const handleDeleteVideo = async (id: string) => {
        if (isEditingOrder) {
            setVideos(prevVideos => prevVideos.filter(video => video.vid !== id));
            if (orderParamCurrentRef.current) {
                orderParamCurrentRef.current.sortData.vids = orderParamCurrentRef.current.sortData.vids.filter(vid => vid !== id);
            }
        } else {
            await reloadEditVersion();
            orderParamCurrentRef.current!.sortData.vids = orderParamCurrentRef.current!.sortData.vids.filter(vid => vid !== id);
            PlaylistApi.updateVideosOrder(orderParamCurrentRef.current!).then(async () => {
                await fetchVideos();
                toast.success('Video removed from playlist');
            });
        }
    };

    const handleOrderChange = (oldIndex: number, newIndex: number) => {
        const newVideos = [...videos];
        const [movedItem] = newVideos.splice(oldIndex, 1);
        newVideos.splice(newIndex, 0, movedItem);
        setVideos(newVideos);
    };

    const handleIndexChange = (oldIndex: number, newIndex: number) => {
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
        newVideos.splice(finalIndex, 0, movedItem);
        const updatedVideos = newVideos.map((video, index) => ({
            ...video,
            index: index + 1,
        }));
        const sortedVideos = [...updatedVideos].sort((a, b) => a.index - b.index);
        setVideos(sortedVideos);
    };

    const handleSaveOrder = async () => {
        if (orderParamCurrentRef.current === null) return;
        setConfirmSaveOrderOpen(true);
    };

    const confirmSaveOrder = async () => {
        await reloadEditVersion();
        const videoIds = videosRef.current.map(video => video.vid);
        orderParamCurrentRef.current!.sortData.vids = videoIds;
        PlaylistApi.updateVideosOrder(orderParamCurrentRef.current!).then(res => {
            if (res.code === 0) {
                toast.success('Video order updated successfully');
                fetchVideos();
                setIsEditingOrder(false);
            } else {
                toast.error('Failed to update video order');
            }
        });
        setConfirmSaveOrderOpen(false);
    };

    const handleSave = async (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => {
        setSaveLoading(true);
        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0) {
                videoData.cover = res.data ?? '';
            } else {
                toast.error('Failed to upload cover image');
                setSaveLoading(false);
                return;
            }
        }
        if (videoFile) {
            const formData = new FormData();
            formData.append('file', videoFile);
            const replaceRes = await VideoApi.replace({ vid: editingVideo?.vid ?? '', formData });
            if (replaceRes.code === 0) {
                videoData.videoPath = replaceRes.data.videoSourceUrl ?? '';
                videoData.videoSourceUrl = replaceRes.data.videoSourceUrl ?? '';
            } else {
                toast.error('Failed to replace video');
                setSaveLoading(false);
                return;
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

    const addButton = () => {
        return (
            <AddVideoButton
                onChooseExisting={() => setIsAddContentOpen(true)}
                onUploadNew={() => {
                    setMaxLimit(200 - videos.length);
                    setPlaylistId(playlist?.playlistId ?? '');
                    setIsUploadModalOpen(true);
                }}
            />
        );
    };

    useEffect(() => {
        console.log('-----------------playlistId:',playlist?.playlistId);
    }, [playlist]);

    const handleTitleOrder = () => {
        const newVideos = [...videos];
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        newVideos.sort((a, b) => collator.compare(a.title || '', b.title || ''));
        setVideos(newVideos);
    };



    return (
        <div className="flex flex-col h-screen">
            <Header
                customTitle={
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => {
                                router.back();
                            }}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <IconArrowLeft size={20} />
                        </div>
                        <h1 className="font-medium">
                            <span className="text-gray-500">Playlists</span> {' / ' + playlist?.title}
                        </h1>
                    </div>
                }
            >
                <div className="flex gap-2">
                    <Button variant="subtle" color="primary" onClick={() => setIsEditing(true)}>
                        Edit Detail
                    </Button>
                    {!isEditingOrder && addButton()}
                </div>
            </Header>
            <div className="px-6 pt-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{videos.length} videos</span>
                    {isEditingOrder && (
                            <Button
                                variant="subtle"
                                color="primary"
                                onClick={() => {
                                   handleTitleOrder();
                                }}
                                px={'sm'}
                            >
                                Order By Title
                            </Button>
                        )}
                </div>
                    <div className="flex">
                       
                        <Button
                            variant="subtle"
                            color={isEditingOrder ? 'red' : 'primary'}
                            onClick={() => (isEditingOrder ? handleSaveOrder() : setIsEditingOrder(true))}
                            px={'sm'}
                        >
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
                                key={video.vid + index}
                                video={video}
                                index={index}
                                isEditing={isEditingOrder}
                                onEdit={setEditingVideo}
                                onDelete={handleDeleteVideo}
                                onOrderChange={handleOrderChange}
                                onIndexChange={handleIndexChange}
                            />
                        ))}

                        {!loading && videos.length === 0 && !isEditingOrder && (
                            <div className="h-full text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                                <div>No videos found</div>
                                {addButton()}
                            </div>
                        )}
                        {loading && <LoadingData />}
                    </div>
                </div>
            </div>
            <AddContentModal isOpen={isAddContentOpen} onClose={() => setIsAddContentOpen(false)} onAdd={handleAddContent} playlistId={playlist?.playlistId ?? ''} />
            <UploadVideoModal
                opened={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
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
                        <VideoDetailEdit
                            playlistId={playlist?.playlistId}
                            isReplace={replaceLoading}
                            video={editingVideo}
                            onClose={() => setEditingVideo(null)}
                            onSave={handleSave}
                            onDelete={video => {
                                handleDeleteVideo(video.vid);
                                setEditingVideo(null);
                            }}
                            deleteString={playlist?.playlistId ? 'Remove from playlist' : 'Delete'}
                            onReplace={() => {}}
                            isUploading={saveLoading}
                        />
                    </div>
                </>
            )}
            <ConfirmDialog
                opened={confirmSaveOrderOpen}
                onClose={() => setConfirmSaveOrderOpen(false)}
                onConfirm={confirmSaveOrder}
                confirmText="Save"
                confirmColor="primary"
                title="Save Order"
                message="Are you sure you want to save the new order?"
            />
        </div>
    );
};

export default PlaylistVideosPage;
