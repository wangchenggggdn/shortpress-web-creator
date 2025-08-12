'use client';

import React, { useEffect, useState } from 'react';
import { IVideo } from '@/types/video';
import { VideoArgs } from '@/api/args';
import VideoDetailEditOther from './detail-edit';
import ChangeSubtitle from './change-subtitle';
import VideoApi from '@/api/video';
import { toast } from 'sonner';

interface VideoDetailEditProps {
    isOpen: boolean;
    video: IVideo | null | undefined;
    deleteString?: string;
    isUploading: boolean;
    isReplace: boolean;
    playlistId?: string;
    onClose: () => void;
    onSave: (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => Promise<boolean>;
    onDelete: (video: IVideo) => void;
}

const VideoDetailEdit: React.FC<VideoDetailEditProps> = ({
    video,
    deleteString,
    isUploading,
    isReplace,
    playlistId,
    isOpen,
    onClose,
    onSave,
    onDelete
}) => {
    const [showChangeSubtitleModal, setShowChangeSubtitleModal] = useState(false);
    const [isVideoEditOpen, setIsVideoEditOpen] = useState(false);
    const [videoEdit, setVideoEdit] = useState<IVideo | null>(null);

    useEffect(() => {
        if (isOpen && video) {
            setIsVideoEditOpen(true);
            setVideoEdit(JSON.parse(JSON.stringify(video)));
        } else {
            setIsVideoEditOpen(false);
        }
    }, [isOpen, video]);

    const handleClose = () => {
        setIsVideoEditOpen(false);
        setVideoEdit(null);
        onClose();
    };

    const handleTriggerSave = async (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File): Promise<boolean> => {
        if (!videoEdit) return false;
        try {
            const result = await onSave(videoData, coverFile, videoFile);
            if (result) {
                handleClose();
            }
            return result;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    };

    const handleChangeSubtitleSave = async (languageCode: string, file: File) => {
        if (!videoEdit) return false;

        const formData = new FormData();
        formData.append('file', file);
        const res = await VideoApi.uploadSubtitle(formData, videoEdit.vid ?? '');
        if (res.code !== 0) {
            toast.error(`Upload failed:${res.info}`);
            return false;
        }

        const uploadedPath = res.data;
        
        setVideoEdit(prev => prev ? {
            ...prev,
            subtitles: {
                ...(prev.subtitles ?? {}),
                [languageCode]: {
                    path: uploadedPath,
                    desc: file.name,
                },
            },
        } : null);
        setShowChangeSubtitleModal(false);
        setIsVideoEditOpen(true);
        return true;
    };

    return (
        (isVideoEditOpen || showChangeSubtitleModal) && <div className='fixed inset-0 bg-black/20 z-50' onClick={() => {
            if (showChangeSubtitleModal) {
                setShowChangeSubtitleModal(false);
                setIsVideoEditOpen(true);
            } else {
                handleClose();
            }
        }}>
            <div onClick={(e) => e.stopPropagation()}>

                {isVideoEditOpen && videoEdit && (
                    <VideoDetailEditOther
                        editVideo={videoEdit}
                        onVideoChange={setVideoEdit}
                        onSave={handleTriggerSave}
                        deleteString={deleteString}
                        isUploading={isUploading}
                        isReplace={isReplace}
                        playlistId={playlistId}
                        onClose={handleClose}
                        onDelete={onDelete}
                        onOpenSubtitlesModal={() => {
                            setShowChangeSubtitleModal(true);
                            setIsVideoEditOpen(false);
                        }}
                    />
                )}

                {showChangeSubtitleModal && videoEdit && (
                    <ChangeSubtitle
                        video={videoEdit}
                        isOpen={showChangeSubtitleModal}
                        onClose={() => {
                            setShowChangeSubtitleModal(false);
                            setIsVideoEditOpen(true);
                        }}
                        onSave={handleChangeSubtitleSave}
                        onBackToSubtitles={() => {
                            setShowChangeSubtitleModal(false);
                            setIsVideoEditOpen(true);
                        }}
                    />
                )}
            
            </div>
        </div>
    );
};

export default VideoDetailEdit;