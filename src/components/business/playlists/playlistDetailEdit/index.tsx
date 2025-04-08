'use client';

import React, { useEffect, useState } from 'react';
import { TextInput, Textarea, Button, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { Playlist, PlaylistStatus } from '@/types/playlist';
import { PlaylistArgs } from '@/api/args';
import PlaylistApi from '@/api/playlist';
import userStore from '@/store/useUserStore';

/**
 * Props interface for PlaylistDetailEdit component
 */
interface PlaylistDetailEditProps {
    /** Existing playlist data for editing */
    playlistOld?: Playlist;
    /** Loading state for save button */
    isLoading?: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when form is submitted */
    onSave: (playlistData: PlaylistArgs.Modify, websiteId?: string, coverFile?: File) => void;
}

/**
 * Modal component for creating or editing a playlist
 * Provides form fields for playlist details and SEO settings
 * @returns React component with playlist creation/editing interface
 */
const PlaylistDetailEdit: React.FC<PlaylistDetailEditProps> = ({ playlistOld = { status: 2 } as Playlist, onClose, onSave, isLoading = false }) => {
    const [coverFile, setCoverFile] = useState<File>();
    const isEdit = !!playlistOld.playlistId;
    const [playlist, setPlaylist] = useState<Playlist>(playlistOld);
    const { userInfo } = userStore();

    // Fetch playlist data when editing
    useEffect(() => {
        if (playlist.playlistId) {
            PlaylistApi.get(playlist.playlistId).then(res => {
                setPlaylist(res.data);
            });
        }
    }, [playlistOld.playlistId]);

    /**
     * Handle form submission
     * @param playlistData Playlist data to submit
     * @param coverFile Optional cover image file
     */
    const handleSave = (playlistData: Partial<Playlist>, coverFile?: File) => {
        onSave(
            {
                ...playlistData,
                playlistId: playlistData?.playlistId ?? '',
            },
            userInfo?.website?.siteId ?? undefined,
            coverFile
        );
        onClose();
    };

    /**
     * Handle cover image upload
     */
    const handleUploadImage = () => {
        const file = document.createElement('input');
        file.type = 'file';
        file.accept = 'image/*';
        file.onchange = (e: any) => {
            setCoverFile(e.target.files[0]);
        };
        file.click();
    };

    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            <div className="w-[480px] bg-layout h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 h-16 border-b">
                    <h2 className="text-lg font-medium">{!isEdit ? 'Create playlist' : 'Playlist details'}</h2>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <TextInput
                                defaultValue={playlist?.title}
                                placeholder="Enter playlist title"
                                onChange={e => {
                                    playlist.title = e.target.value;
                                }}
                                variant="filled"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                placeholder="Add some description"
                                minRows={4}
                                defaultValue={playlist?.description}
                                onChange={e => {
                                    playlist.description = e.target.value;
                                }}
                                variant="filled"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <TextInput
                                placeholder="Add tags"
                                defaultValue={playlist?.tags}
                                onChange={e => {
                                    playlist.tags = e.target.value;
                                }}
                                variant="filled"
                            />
                        </div>
                    </div>

                    {/* Cover Image */}
                    {isEdit && (
                        <div>
                            <h3 className="text-lg font-medium mb-4">Cover</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-32 bg-[#F4F4F7] rounded-lg flex items-center justify-center">
                                    {playlist.cover && playlist.cover.length > 0 && !coverFile && (
                                        <img src={playlist.cover} alt="logo" className="w-full h-full object-cover rounded-lg" />
                                    )}
                                    {coverFile && <img src={URL.createObjectURL(coverFile)} alt="logo" className="w-full h-full object-cover rounded-lg" />}
                                </div>
                                <Button variant="filled" color="primary" size="md" onClick={() => handleUploadImage()}>
                                    Upload Image
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Select
                            defaultValue={playlist?.status?.toString() ?? '2'}
                            data={[
                                { value: PlaylistStatus.PUBLISHED.toString(), label: 'Published' },
                                { value: PlaylistStatus.UNPUBLISHED.toString(), label: 'Unpublished' },
                            ]}
                            onChange={e => {
                                playlist.status = Number(e);
                            }}
                            variant="filled"
                        />
                    </div>

                    {/* SEO Settings */}
                    {isEdit && (
                        <div className="space-y-4">
                            <h3 className="text-base font-medium">SEO</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <TextInput
                                    defaultValue={playlist?.seo?.title}
                                    placeholder="SEO title"
                                    onChange={e => {
                                        playlist.seo = {
                                            title: e.target.value,
                                            description: playlist.seo?.description ?? '',
                                            keywords: playlist.seo?.keywords ?? '',
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
                                    defaultValue={playlist?.seo?.description}
                                    onChange={e => {
                                        playlist.seo = {
                                            title: playlist.seo?.title ?? '',
                                            description: e.target.value,
                                            keywords: playlist.seo?.keywords ?? '',
                                        };
                                    }}
                                    variant="filled"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Keywords</label>
                                <TextInput
                                    placeholder="Add keywords, comma separated"
                                    defaultValue={playlist?.seo?.keywords}
                                    onChange={e => {
                                        playlist.seo = {
                                            title: playlist.seo?.title ?? '',
                                            description: playlist.seo?.description ?? '',
                                            keywords: e.target.value,
                                        };
                                    }}
                                    variant="filled"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-white">
                    <Button loading={isLoading} fullWidth color="primary" onClick={() => handleSave(playlist, coverFile)}>
                        {!isEdit ? 'Create Playlist' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetailEdit;
