'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TextInput, Textarea, Button, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { Playlist, PlaylistStatus } from '@/types/playlist';
import { PlaylistArgs } from '@/api/args';
import PlaylistApi from '@/api/playlist';
import userStore from '@/store/useUserStore';

interface PlaylistDetailEditProps {
    playlistOld?: Playlist;
    isLoading?: boolean;
    onClose: () => void;
    onSave: (playlistData: PlaylistArgs.Modify, websiteId?: string, coverFile?: File) => Promise<boolean>;
}

const PlaylistDetailEdit: React.FC<PlaylistDetailEditProps> = ({ playlistOld = { status: 2 } as Playlist, onClose, onSave, isLoading = false }) => {
    const [coverFile, setCoverFile] = useState<File>();
    const [playlist, setPlaylist] = useState<Playlist>(playlistOld);
    const { userInfo } = userStore();
    const isEdit = !!playlistOld.playlistId;

    useEffect(() => {
        if (isEdit && playlistOld.playlistId) {
            PlaylistApi.get(playlistOld.playlistId).then(res => {
                setPlaylist(prevPlaylist => ({
                    ...prevPlaylist,  
                    ...res.data,      
                    seo: {
                        ...(prevPlaylist.seo ?? {}),  
                        ...(res.data.seo ?? {}),     
                    }
                }));
            });
        }
    }, [playlistOld.playlistId, isEdit]);

    const handleInputChange = useCallback((field: keyof Playlist, value: any) => {
        setPlaylist(prevPlaylist => ({
            ...prevPlaylist,
            [field]: value,
        }));
    }, []);

    const handleSeoChange = useCallback((field: 'title' | 'description' | 'keywords', value: string) => {
        setPlaylist(prevPlaylist => ({
            ...prevPlaylist,
            seo: {
                ...(prevPlaylist.seo ?? {}),
                [field]: value,
            },
        }));
    }, []);

    const handleSave = async () => {
        try {
            const result = await onSave(
                {
                    ...playlist,
                    playlistId: playlist?.playlistId ?? '',
                },
                userInfo?.website?.siteId ?? undefined,
                coverFile
            );
            
            if (result) {
                onClose();
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handleUploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e: any) => {
            if (e.target.files && e.target.files.length > 0) {
                setCoverFile(e.target.files[0]);
            }
        };
        fileInput.click();
    };

    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            <div className="w-[480px] bg-layout h-full flex flex-col">
                <div className="flex items-center justify-between px-6 h-16 border-b">
                    <h2 className="text-lg font-medium">{!isEdit ? 'Create playlist' : 'Playlist details'}</h2>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <TextInput
                                value={playlist?.title ?? ''}
                                placeholder="Enter playlist title"
                                onChange={e => handleInputChange('title', e.target.value)}
                                variant="filled"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                value={playlist?.description ?? ''}
                                placeholder="Add some description"
                                minRows={4}
                                onChange={e => handleInputChange('description', e.target.value)}
                                variant="filled"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tags</label>
                            <TextInput
                                value={playlist?.tags ?? ''}
                                placeholder="Add tags"
                                onChange={e => handleInputChange('tags', e.target.value)}
                                variant="filled"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Cover</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 bg-[#F4F4F7] rounded-lg flex items-center justify-center overflow-hidden">
                                {coverFile 
                                    ? <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                    : playlist.cover && <img src={playlist.cover} alt="Cover" className="w-full h-full object-cover" />
                                }
                            </div>
                            <Button variant="filled" color="primary" size="md" onClick={handleUploadImage}>
                                Upload Image
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Select
                            value={playlist?.status?.toString() ?? '2'}
                            data={[
                                { value: PlaylistStatus.PUBLISHED.toString(), label: 'Published' },
                                { value: PlaylistStatus.UNPUBLISHED.toString(), label: 'Unpublished' },
                            ]}
                            onChange={value => handleInputChange('status', Number(value))}
                            variant="filled"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-base font-medium">SEO</h3>
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <TextInput
                                value={playlist?.seo?.title ?? ''}
                                placeholder="SEO title"
                                onChange={e => handleSeoChange('title', e.target.value)}
                                variant="filled"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Textarea
                                value={playlist?.seo?.description ?? ''}
                                placeholder="Add description"
                                minRows={3}
                                onChange={e => handleSeoChange('description', e.target.value)}
                                variant="filled"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Keywords</label>
                            <TextInput
                                value={playlist?.seo?.keywords ?? ''}
                                placeholder="Add keywords, comma separated"
                                onChange={e => handleSeoChange('keywords', e.target.value)}
                                variant="filled"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white">
                    <Button loading={isLoading} fullWidth color="primary" onClick={handleSave}>
                        {!isEdit ? 'Create Playlist' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetailEdit;