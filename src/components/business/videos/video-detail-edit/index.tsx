'use client';

import React, { useEffect, useState } from 'react';
import { IVideo } from '@/types/video';
import { VideoArgs } from '@/api/args';
import VideoDetailEditOther from './detail-edit';
import ChangeSubtitle from './change-subtitle';
import VideoApi from '@/api/video';

/**
 * Props interface for VideoDetailEdit component
 */
interface VideoDetailEditProps {
    isOpen: boolean;
    /** Video data to edit */
    video: IVideo | null | undefined;
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
    onSave: (videoData: VideoArgs.Modify, coverFile?: File, videoFile?: File) => void;
    /** Callback function when video is replaced */
    onReplace: (videoFile: File | undefined) => void;
    /** Callback function when video is deleted */
    onDelete: (video: IVideo) => void;
}

/**
 * Video detail edit component
 * Provides form for editing video details including title, description, cover, and SEO settings
 * @returns React component with video editing interface
 */
const VideoDetailEdit: React.FC<VideoDetailEditProps> = ({ video, deleteString, isUploading, isReplace, playlistId, isOpen, onClose, onSave, onReplace, onDelete }) => {
    const [showChangeSubtitleModal, setShowChangeSubtitleModal] = useState(false);
    const [isVideoEditOpen, setIsVideoEditOpen] = useState(isOpen);
    const [videoEdit, setVideoEdit] = useState<IVideo>(JSON.parse(JSON.stringify(video!)));

    const handleChangeSubtitleSave = async (languageCode: string, file: File) => {
        // 这里应该调用上传API
       
        const formData = new FormData();
        formData.append('file', file);
        const res = await VideoApi.uploadSubtitle(formData, video!.vid);
        const uploadedPath = res.data;
        
        setVideoEdit(prev => ({
            ...prev,
            subtitles: {
                ...videoEdit.subtitles,
                [languageCode]: {
                    path: uploadedPath,
                    desc: file.name,
                },
            },
        }));
        setShowChangeSubtitleModal(false);
    };

    useEffect(() => {
        if(isOpen){
            setIsVideoEditOpen(true);
            setVideoEdit(JSON.parse(JSON.stringify(video!)));
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVideoEditOpen(false);
        onClose();
    }

    return (
        (isVideoEditOpen || showChangeSubtitleModal) &&  <div className='fixed inset-0 bg-black/20 z-50' onClick={()=>{
            if(showChangeSubtitleModal){
                setShowChangeSubtitleModal(false);
            }else{
                handleClose();
            }
        }}>
            <div onClick={(e)=>{
                e.stopPropagation();
            }}>

            {/* edit video */}
            {isVideoEditOpen &&videoEdit && (
                <VideoDetailEditOther editVideo={videoEdit} deleteString={deleteString} isUploading={isUploading} isReplace={isReplace} playlistId={playlistId} onClose={handleClose} onSave={()=>{
                    handleClose();
                    onSave(videoEdit);
                }} onReplace={onReplace} onDelete={onDelete} onOpenSubtitlesModal={() => {
                    setShowChangeSubtitleModal(true);
                    setIsVideoEditOpen(false);
                }} setEditVideo={setVideoEdit} />
            )}

            {/* change subtitle */}
            {showChangeSubtitleModal && videoEdit && (
                <ChangeSubtitle
                    videoId={videoEdit.vid}
                    videoTitle={videoEdit.title}
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
