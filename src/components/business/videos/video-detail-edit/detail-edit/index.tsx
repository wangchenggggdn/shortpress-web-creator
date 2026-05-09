'use client';
import { VideoArgs } from '@/api/args';
import { IVideo, VideoSourceType, VideoStatus } from '@/types/video';
import { Button, NumberInput, ScrollArea, Select, TextInput, Textarea } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import React, { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { withResMediaCacheBust } from '@/utils/mediaUrl';
import VideoPreview from '../../video-preview';
import SourceItem from '../source-item';
import styles from './style.module.css';
import SubtitlesManager from './subtitles-manager';
import useUserStore from '@/store/useUserStore';
import { WebTemplate } from '@/types/website';
import { CreateTemplateType } from '@/types/video';

interface VideoDetailEditOtherProps {
    editVideo: IVideo;
    deleteString?: string;
    isUploading: boolean;
    isReplace: boolean;
    playlistId?: string;
    coverFile?: File;
    videoFile?: File;
    onCoverFileChange: (file: File | undefined) => void;
    onVideoFileChange: (file: File | undefined) => void;
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
    coverFile,
    videoFile,
    onCoverFileChange,
    onVideoFileChange,
    onClose,
    onSave,
    onDelete,
    onOpenSubtitlesModal,
    onVideoChange,
}) => {
    const userInfo = useUserStore(state => state.userInfo);
    const templateName = userInfo?.website?.templateName;
    const handleInputChange = useCallback(
        (field: keyof IVideo, value: any) => {
            onVideoChange(prevVideo => {
                if (!prevVideo) return null;
                return {
                    ...prevVideo,
                    [field]: value,
                };
            });
        },
        [onVideoChange]
    );

    const handleSubtitlesChange = useCallback(
        (subtitles: { [key: string]: { path: string; desc: string } } | undefined) => {
            onVideoChange(prevVideo => {
                if (!prevVideo) return null;
                return {
                    ...prevVideo,
                    subtitles,
                };
            });
        },
        [onVideoChange]
    );

    const handleTriggerSave = async () => {
        if (templateName === WebTemplate.SORA_APP && editVideo.config?.templateType !== CreateTemplateType.none && !editVideo.config?.effectId) {
            toast.warning('Please add template id');
            return;
        }
        if (editVideo.sources?.some(source => source.url === '')) {
            toast.error('Please add a video source');
            return;
        }
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
        fileInput.accept = 'image/*,video/webm';
        fileInput.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onCoverFileChange(file);
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
                onVideoFileChange(file);
            }
        };
        fileInput.click();
    };

    // Add a new video source item, ensuring it conforms to the IVideoSource interface requirements.
    const handleAddSource = useCallback(() => {
        onVideoChange(prevVideo => {
            if (!prevVideo) return null;
            // Construct a new source object with default values for all IVideoSource fields.
            const newSource = {
                priority: prevVideo.sources?.length ?? 0,
                sourceType: VideoSourceType.EMBED,
                url: '',
                provider: 'unknown',
            };
            return {
                ...prevVideo,
                sources: [...(prevVideo.sources ?? []), newSource],
            };
        });
    }, [onVideoChange]);

    useEffect(() => {
        console.log('editVideo.sources', editVideo.sources);
    }, [editVideo.sources]);

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
                    <ScrollArea scrollbars="y" type="auto" classNames={{ viewport: styles['custom-scroll'] }}>
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
                                    <TextInput value={editVideo.tags ?? ''} placeholder="Add tags" onChange={e => handleInputChange('tags', e.target.value)} variant="filled" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Cover</label>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="w-[120px] aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        {coverFile ? (
                                            coverFile.type.startsWith('video/') || coverFile.name.toLowerCase().endsWith('.webm') ? (
                                                <video src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                            ) : (
                                                <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                            )
                                        ) : editVideo.cover ? (
                                            editVideo.cover.toLowerCase().includes('.webm') ? (
                                                <video
                                                    src={withResMediaCacheBust(editVideo.cover, editVideo.updatedAt) ?? editVideo.cover}
                                                    className="w-full h-full object-cover"
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={withResMediaCacheBust(editVideo.cover, editVideo.updatedAt) ?? editVideo.cover}
                                                    alt="cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            )
                                        ) : null}
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
                            {templateName === WebTemplate.SORA_APP && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Points</label>
                                        <NumberInput
                                            value={editVideo.config?.coin ?? 0}
                                            onChange={value =>
                                                handleInputChange('config', {
                                                    ...editVideo.config,
                                                    coin: Number(value),
                                                })
                                            }
                                            min={0}
                                            variant="filled"
                                            placeholder="Enter points required"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Template Type</label>
                                        <Select
                                            data={[
                                                { value: CreateTemplateType.none, label: 'None' },
                                                { value: CreateTemplateType.vidu, label: 'Vidu' },
                                                { value: CreateTemplateType.dance, label: 'Dance' },
                                                { value: CreateTemplateType.spicy, label: 'Spicy' },
                                            ]}
                                            value={editVideo.config?.templateType || CreateTemplateType.none}
                                            onChange={value =>
                                                handleInputChange('config', {
                                                    ...editVideo.config,
                                                    templateType: value,
                                                })
                                            }
                                            variant="filled"
                                            placeholder="Select template type"
                                            allowDeselect={false}
                                        />
                                    </div>
                                    {(editVideo.config?.templateType || CreateTemplateType.none) !== CreateTemplateType.none && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Template ID <span className="text-red-500">*</span>
                                            </label>
                                            <TextInput
                                                value={editVideo.config?.effectId ?? ''}
                                                onChange={e =>
                                                    handleInputChange('config', {
                                                        ...editVideo.config,
                                                        effectId: e.target.value,
                                                    })
                                                }
                                                variant="filled"
                                                placeholder="Enter template ID"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2">Media Resources</label>
                                <div className="space-y-2">
                                    {editVideo.sources
                                        ?.sort((a, b) => a.priority - b.priority)
                                        .map((item, index) => (
                                            <SourceItem
                                                key={item.url + index}
                                                source={item}
                                                playlistId={playlistId}
                                                onVideoChange={onVideoChange}
                                                onDeleteVideo={() => onDelete(editVideo)}
                                                onReplace={uploadVideo}
                                            />
                                        ))}
                                    <Button color="primary" fullWidth leftSection={<IconPlus size={16} />} onClick={handleAddSource}>
                                        Add New Link
                                    </Button>
                                </div>
                            </div>
                            <SubtitlesManager video={editVideo} onSubtitlesChange={handleSubtitlesChange} onOpenSubtitlesModal={onOpenSubtitlesModal} />
                        </div>
                    </ScrollArea>

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
