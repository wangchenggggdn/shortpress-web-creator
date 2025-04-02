import React, { useRef, useEffect, useState } from 'react';
import { IconPlayerPlay, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import VideoInfo from '../videoInfo/videoInfo';

/**
 * Props interface for WebsiteVideoPlayer component
 */
interface WebsiteVideoPlayerProps {
    /** Video source URL */
    src: string;
    /** Poster/thumbnail image URL */
    poster?: string;
    /** Whether the video is currently playing */
    isPlaying: boolean;
    /** Callback function when video ends */
    onEnded: () => void;
    /** Title of the video */
    title?: string;
    /** Description of the video */
    description?: string;
    /** Callback function when play/pause state changes */
    onPlayPause?: (playing: boolean) => void;
    /** Callback function when watch full button is clicked */
    onWatchFull?: () => void;
    /** Callback function when title is clicked */
    onTitleClick?: () => void;
}

/**
 * Video player component for website preview
 * Provides video playback with controls and information display
 * @returns React component with video player interface
 */
const WebsiteVideoPlayer: React.FC<WebsiteVideoPlayerProps> = ({ src, poster, isPlaying, onEnded, title, description, onPlayPause, onWatchFull, onTitleClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

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

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video loading error:', e);
    };

    return (
        <div className="relative w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted={isMuted} loop={false} onEnded={onEnded} onError={handleError}>
                <source src={src} type="video/mp4" />
                <source src={src} type="video/webm" />
                <source src={src} type="video/ogg" />
                Your browser does not support the video tag.
            </video>

            {/* Playback Controls */}
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => onPlayPause?.(!isPlaying)}>
                {!isPlaying && (
                    <div className="bg-black/30 rounded-full p-4">
                        <IconPlayerPlay size={48} className="text-white" />
                    </div>
                )}
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <VideoInfo title={title} description={description} poster={poster} onWatchFull={onWatchFull} onTitleClick={onTitleClick} />

                {/* Progress Bar */}
                <div className="mt-4 h-[2px] bg-white/30 rounded-full overflow-hidden cursor-pointer" onClick={handleProgressClick}>
                    <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <button 
                onClick={toggleMute}
                className="absolute top-12 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
            >
                {isMuted ? <IconVolumeOff size={12} /> : <IconVolume size={12} />}
            </button>
        </div>
    );
};

export default WebsiteVideoPlayer;
