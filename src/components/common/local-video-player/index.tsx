'use client';

import { IconPlayerPlay, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

interface LocalVideoPlayerProps {
    /** Local video file to play */
    file: File;
    /** CSS class name for the video element */
    className?: string;
    /** Whether the video is currently playing */
    isPlaying?: boolean;
    /** Callback when play/pause state changes */
    onPlayPause?: (isPlaying: boolean) => void;
    /** Callback when video ends */
    onEnded?: () => void;
}

/**
 * Local video player component for playing File objects
 * Provides play/pause controls and handles local video playback
 */
const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({ file, className = '', isPlaying = false, onPlayPause, onEnded }) => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Load video when component mounts or file changes
    useEffect(() => {
        if (videoRef.current) {
            setIsLoading(true);
            setIsVideoLoaded(false);

            const objectUrl = URL.createObjectURL(file);
            videoRef.current.src = objectUrl;
            videoRef.current.muted = true; // Default muted
            videoRef.current.load();

            // Cleanup function to revoke object URL to prevent memory leaks
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }
    }, [file]);

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
        setIsLoading(false);
    };

    // Handle play/pause logic
    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            onPlayPause?.(false);
        } else {
            videoRef.current.play();
            onPlayPause?.(true);
        }
    };

    const handleVideoEnded = () => {
        onPlayPause?.(false);
        onEnded?.();
    };

    const handleToggleMute = () => {
        if (videoRef.current) {
            const newMutedState = !isMuted;
            videoRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Video element */}
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${className} ${!isVideoLoaded ? 'hidden' : ''}`}
                onLoadedData={handleVideoLoad}
                onEnded={handleVideoEnded}
                onClick={handlePlayPause}
                preload="metadata"
            />

            {/* Loading State - shown before video is loaded */}
            {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlayPause}>
                    {/* Fallback Background */}
                    <div className="absolute inset-0 bg-gray-100"></div>

                    {/* Loading Spinner */}
                    {isLoading ? (
                        <div className="relative z-10 bg-black/30 rounded-full p-4">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="relative z-10 bg-black/30 rounded-full p-4">
                            <IconPlayerPlay size={48} className="text-white" />
                        </div>
                    )}
                </div>
            )}

            {/* Playback Controls - only show when video is loaded */}
            {isVideoLoaded && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlayPause}>
                        {!isPlaying && (
                            <div className="bg-black/30 rounded-full p-4">
                                <IconPlayerPlay size={48} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Audio Control Button */}
                    <button
                        className="absolute bottom-4 right-4 bg-black/30 rounded-full p-2 text-white hover:bg-black/50 transition-colors"
                        onClick={e => {
                            e.stopPropagation();
                            handleToggleMute();
                        }}
                    >
                        {isMuted ? <IconVolumeOff size={24} /> : <IconVolume size={24} />}
                    </button>
                </>
            )}
        </div>
    );
};

export default LocalVideoPlayer;
