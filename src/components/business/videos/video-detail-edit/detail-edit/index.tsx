'use client';

import React, { useState, useCallback } from 'react';
import { TextInput, Textarea, Button, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { IVideo, VideoStatus } from '@/types/video';
import VideoPreview from '../../video-preview';
import SubtitlesManager from './subtitles-manager';
import { VideoArgs } from '@/api/args';

interface VideoDetailEditOtherProps {
    editVideo: IVideo; 
    deleteString?: string;
    isUploading: boolean;
    isReplace: boolean;
    playlistId?: string;
    onClose: () => void;
    onSave: (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => Promise<boolean>;
    onDelete: (video: IVideo) => void;
    onOpenSubtitlesModal: () => void;
    onVideoChange: React.Dispatch<React.SetStateAction<IVideo | null>>;
}

const VideoDetailEditOther: React.FC<VideoDetailEditOtherProps> = ({
    editVideo,
    deleteString,
    isUploading,
    isReplace,
    playlistId,
    onClose,
    onSave,
    onDelete,
    onOpenSubtitlesModal,
    onVideoChange,
}) => {
    const [coverFile, setCoverFile] = useState<File>();
    const [videoFile, setVideoFile] = useState<File>();

    const handleInputChange = useCallback((field: keyof IVideo, value: any) => {
        onVideoChange(prevVideo => {
            if (!prevVideo) return null; 
            return {
                ...prevVideo,
                [field]: value,
            };
        });
    }, [onVideoChange]);

    const handleSubtitlesChange = useCallback((subtitles: { [key: string]: { path: string; desc: string; } } | undefined) => {
        onVideoChange(prevVideo => {
            if (!prevVideo) return null;
            return {
                ...prevVideo,
                subtitles,
            };
        });
    }, [onVideoChange]);

    const handleTriggerSave = async () => {
        try {
            const result = await onSave(
                {
                    ...editVideo,
                    vid: editVideo.vid,
                },
                coverFile,
                videoFile
            );
            
            if (result) {
                onClose();
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const uploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) setCoverFile(file);
        };
        fileInput.click();
    };

    const uploadVideo = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setVideoFile(file);
            }
        };
        fileInput.click();
    };
    
    // 因为父组件保证了 editVideo 不为 null，所以 JSX 部分无需大的改动
    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            <div className="flex items-center justify-between px-6 h-16 bg-white">
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
                        onDelete={() => onDelete(editVideo)}
                    />
                </div>
                <div className="w-80 bg-layout flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-6 space-y-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <TextInput
                                        value={editVideo.title ?? ''}
                                        placeholder="Enter video title"
                                        onChange={e => handleInputChange('title', e.target.value)}
                                        variant="filled"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        value={editVideo.description ?? ''}
                                        placeholder="Add some description"
                                        minRows={4}
                                        onChange={e => handleInputChange('description', e.target.value)}
                                        variant="filled"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags</label>
                                    <TextInput
                                        value={editVideo.tags ?? ''}
                                        placeholder="Add tags"
                                        onChange={e => handleInputChange('tags', e.target.value)}
                                        variant="filled"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cover</label>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="w-[120px] aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {coverFile 
                                            ? <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                            : editVideo.cover && <img src={editVideo.cover} alt="cover" className="w-full h-full object-cover" />
                                        }
                                    </div>
                                    <div className="flex-1 px-6">
                                        <Button style={{ width: '100%' }} variant="light" onClick={uploadImage}>
                                            Upload Image
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <Select
                                    value={editVideo.status?.toString() ?? '0'}
                                    data={[
                                        { value: VideoStatus.PUBLISHED.toString(), label: 'Published' },
                                        { value: VideoStatus.UNPUBLISHED.toString(), label: 'Unpublished' },
                                    ]}
                                    onChange={value => handleInputChange('status', parseInt(value ?? '0'))}
                                    variant="filled"
                                />
                            </div>
                            <SubtitlesManager
                                video={editVideo}
                                onSubtitlesChange={handleSubtitlesChange}
                                onOpenSubtitlesModal={onOpenSubtitlesModal}
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-white flex-shrink-0">
                        <Button loading={isUploading} fullWidth color="primary" onClick={handleTriggerSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailEditOther;