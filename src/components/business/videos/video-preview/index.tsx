'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@mantine/core';
import { IVideo } from '@/types/video';
import VideoPlayer from '@/components/common/video-player';
import LocalVideoPlayer from '@/components/common/local-video-player';

interface VideoPreviewProps {
    video: IVideo | File;
    deleteString?: string;
    isReplace?: boolean;
    playlistId?: string;
    onReplace?: () => void;
    onDelete?: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, playlistId, deleteString = 'Delete Video', isReplace = false, onReplace, onDelete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <div className="w-full bg-layout flex flex-col">
            <div className="aspect-[9/16] bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                {video instanceof File ? (
                    <LocalVideoPlayer
                        file={video}
                        className="rounded-lg"
                        isPlaying={isPlaying}
                        onEnded={() => setIsPlaying(false)}
                        onPlayPause={setIsPlaying}
                    />
                ) : (
                    <VideoPlayer
                        key={video.videoSourceUrl}
                        videoClassName="rounded-lg"
                        src={video.videoSourceUrl ?? ''}
                        coverUrl={video.cover ?? ''}
                        isPlaying={isPlaying}
                        onEnded={() => setIsPlaying(false)}
                        onPlayPause={setIsPlaying}
                        title={video.title}
                    />
                )}
            </div>
            <div className="mt-4 space-y-2">
                {!playlistId && (
                    <Button loading={isReplace} fullWidth variant="filled" color="primary" onClick={onReplace}>
                        Replace Video
                    </Button>
                )}
                <Button fullWidth variant="subtle" color="red" onClick={onDelete}>
                    {deleteString}
                </Button>
            </div>
        </div>
    );
};

export default VideoPreview;
