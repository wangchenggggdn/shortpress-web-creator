'use client';

import React, { useState } from 'react';
import { TextInput, Textarea, Button, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { IVideo, VideoStatus } from '@/types/video';
import VideoPreview from '../../video-preview';
import SubtitlesManager from './subtitles-manager';
import { VideoArgs } from '@/api/args';

/**
 * Props interface for VideoDetailEdit component
 */
interface VideoDetailEditOtherProps {
    /** Video data to edit */
    editVideo: IVideo;
    /** Custom text for delete button */
    deleteString?: string;
    /** Whether the video is being uploaded */
    isUploading: boolean;
    /** Whether the video is being replaced */
    isReplace: boolean;
    /** Playlist ID */
    playlistId?: string;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when form is submitted */
    onSave: (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => Promise<boolean>;
    /** Callback function when video is replaced */
    onReplace: (videoFile: File | undefined) => void;
    /** Callback function when video is deleted */
    onDelete: (video: IVideo) => void;
    onOpenSubtitlesModal: () => void;
    setEditVideo: (video: IVideo) => void;
}

/**
 * Video detail edit component
 * Provides form for editing video details including title, description, cover, and SEO settings
 * @returns React component with video editing interface
 */
const VideoDetailEditOther: React.FC<VideoDetailEditOtherProps> = ({ editVideo, deleteString, isUploading, isReplace, playlistId, onClose, onSave, onReplace, onDelete, onOpenSubtitlesModal, setEditVideo }) => {
    const [coverFile, setCoverFile] = useState<File>();
    const [videoFile, setVideoFile] = useState<File>();

    /**
     * Handle form submission
     * @param videoData Video data to submit
     */
    const handleSave = async (videoData: Partial<IVideo>) => {
        editVideo = {
            ...editVideo,
            ...videoData,
        };
        
        try {
            // Call onSave and wait for the result
            await onSave(
                {
                    vid: editVideo.vid,
                    ...videoData,
                },
                coverFile,
                videoFile
            );
        } catch (error) {
            // If save fails, don't close the modal
            console.error('Save failed:', error);
            return;
        }
    };

    /**
     * Handle cover image upload
     */
    const uploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            setCoverFile(file);
        };
        fileInput.click();
    };

    /**
     * Handle video file upload
     */
    const uploadVideo = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            setVideoFile(file);
            //onReplace(file);
        };
        fileInput.click();
    };

    return (
        <>
          <div className="fixed top-0 right-0 h-screen shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16  bg-white">
                <h2 className="text-lg font-medium">Video details</h2>
                <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                    <IconX size={20} />
                </Button>
            </div>
            <div className="flex flex-row h-[calc(100vh-4rem)]">
                <div className="w-56 pr-1 pl-8 bg-layout flex items-center">
                    <VideoPreview
                        playlistId={playlistId}
                        isReplace={isReplace}
                        video={videoFile ? videoFile : editVideo}
                        deleteString={deleteString}
                        onReplace={uploadVideo}
                        onDelete={() => {
                            onDelete(editVideo);
                        }}
                    />
                </div>
                <div className="w-80 bg-layout flex flex-col">
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <TextInput
                                        defaultValue={editVideo.title}
                                        placeholder="Enter video title"
                                        onChange={e => {
                                            editVideo.title = e.target.value;
                                        }}
                                        variant="filled"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        placeholder="Add some description"
                                        minRows={4}
                                        defaultValue={editVideo.description}
                                        onChange={e => {
                                            editVideo.description = e.target.value;
                                        }}
                                        variant="filled"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags</label>
                                    <TextInput
                                        placeholder="Add tags"
                                        defaultValue={editVideo.tags}
                                        onChange={e => {
                                            editVideo.tags = e.target.value;
                                        }}
                                        variant="filled"
                                    />
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Cover</label>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="w-[120px] aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        {editVideo.cover && !coverFile && <img src={editVideo.cover} alt="cover" className="w-full h-full object-cover rounded-lg" />}
                                        {coverFile && <img src={URL.createObjectURL(coverFile)} alt="cover" className="w-full h-full object-cover rounded-lg" />}
                                    </div>
                                    <div className="flex-1 px-6">
                                        <Button style={{ width: '100%' }} variant="light" onClick={uploadImage}>
                                            Upload Image
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <Select
                                    defaultValue={editVideo.status.toString()}
                                    data={[
                                        { value: VideoStatus.PUBLISHED.toString(), label: 'Published' },
                                        { value: VideoStatus.UNPUBLISHED.toString(), label: 'Unpublished' },
                                    ]}
                                    onChange={value => {
                                        editVideo.status = parseInt(value ?? '0');
                                    }}
                                    variant="filled"
                                />
                            </div>

                            {/* Subtitles */}
                            <SubtitlesManager
                                video={editVideo}
                                onSubtitlesChange={(subtitles) => {
                                    setEditVideo({
                                        ...editVideo,
                                        subtitles
                                    });
                                }}
                                onOpenSubtitlesModal={onOpenSubtitlesModal}
                            />

                            {/* SEO Settings */}
                            {/* <div className="space-y-4">
                                <h3 className="text-base font-medium">SEO</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <TextInput
                                        defaultValue={editVideo.seo?.title ?? ''}
                                        placeholder="SEO title"
                                        onChange={e => {
                                            editVideo.seo = {
                                                title: e.target.value,
                                                description: editVideo.seo?.description ?? '',
                                                keywords: editVideo.seo?.keywords ?? '',
                                            };
                                        }}
                                        variant="filled"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        placeholder="Add description"
                                        minRows={3}
                                        defaultValue={editVideo.seo?.description ?? ''}
                                        onChange={e => {
                                            setEditVideo({
                                                ...editVideo,
                                                seo: {
                                                    title: editVideo.seo?.title ?? '',
                                                    description: e.target.value,
                                                    keywords: editVideo.seo?.keywords ?? '',
                                                },
                                            });
                                        }}
                                        variant="filled"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Keywords</label>
                                    <TextInput
                                        placeholder="Add keywords, comma separated"
                                        defaultValue={editVideo.seo?.keywords ?? ''}
                                        onChange={e => {
                                            setEditVideo({
                                                ...editVideo,
                                                seo: {
                                                    title: editVideo.seo?.title ?? '',
                                                    description: editVideo.seo?.description ?? '',
                                                    keywords: e.target.value,
                                                },
                                            });
                                        }}
                                        variant="filled"
                                    />
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-white flex-shrink-0">
                        <Button loading={isUploading} fullWidth color="primary" onClick={() => handleSave(editVideo)}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default VideoDetailEditOther;
