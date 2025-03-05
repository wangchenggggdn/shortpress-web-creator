import React, { useRef, useEffect, useState } from 'react';
import { IconPlayerPlay } from '@tabler/icons-react';

/**
 * Props interface for VideoPlayer component
 */
interface VideoPlayerProps {
    /** Video source URL */
    src: string;
    /** Whether the video is currently playing */
    isPlaying: boolean;
    /** Callback function when video ends */
    onEnded: () => void;
    /** Callback function when play/pause state changes */
    onPlayPause?: (playing: boolean) => void;
    /** Additional CSS classes for video element */
    videoClassName?: string;
}

/**
 * Basic video player component
 * Provides video playback with play/pause controls
 * @returns React component with video player interface
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, isPlaying, onEnded, onPlayPause, videoClassName = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Control video play/pause
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(error => {
                    console.error('Error playing video:', error);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Listen for video metadata loaded event to get total duration
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, []);

    // Listen for video time update event
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const currentProgress = (video.currentTime / video.duration) * 100;
            setProgress(currentProgress);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, []);

    // Handle progress bar click
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = (clickPosition / rect.width) * 100;

        if (videoRef.current) {
            const newTime = (percentage / 100) * duration;
            videoRef.current.currentTime = newTime;
            setProgress(percentage);
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video loading error:', e);
    };

    return (
        <div className="relative w-full h-full">
            {src.length > 0 && (
                <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover ${videoClassName}`}
                    playsInline
                    muted
                    loop={false}
                    controls={false}
                    onEnded={onEnded}
                    onError={handleError}
                >
                    <source src={src} type="video/mp4" />
                    <source src={src} type="video/webm" />
                    <source src={src} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>
            )}

            {/* Playback Controls */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => onPlayPause?.(!isPlaying)}>
                {!isPlaying && (
                    <div className="bg-black/30 rounded-full p-4">
                        <IconPlayerPlay size={48} className="text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
