import React, { useRef, useEffect, useState } from 'react';
import { IconPlayerPlay, IconVolume, IconVolumeOff } from '@tabler/icons-react';

/**
 * Props interface for VideoPlayer component
 */
interface VideoPlayerProps {
    /** Video source URL */
    src: string;
    /** Cover image URL for preview display */
    coverUrl?: string;
    /** Whether the video is currently playing */
    isPlaying: boolean;
    /** Callback function when video ends */
    onEnded: () => void;
    /** Callback function when play/pause state changes */
    onPlayPause?: (playing: boolean) => void;
    /** Additional CSS classes for video element */
    videoClassName?: string;
    /** Video title for preview display */
    title?: string;
}

/**
 * Basic video player component with lazy loading
 * Provides video playback with play/pause controls
 * Videos only load when play button is clicked
 * @returns React component with video player interface
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, coverUrl, isPlaying, onEnded, onPlayPause, videoClassName = '', title = 'Video' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Control video play/pause
    useEffect(() => {
        if (videoRef.current && isVideoLoaded) {
            if (isPlaying) {
                videoRef.current.play().catch(error => {
                    console.error('Error playing video:', error);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, isVideoLoaded]);

    // Listen for video metadata loaded event to get total duration
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isVideoLoaded) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, [isVideoLoaded]);

    // Listen for video time update event
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isVideoLoaded) return;

        const handleTimeUpdate = () => {
            const currentProgress = (video.currentTime / video.duration) * 100;
            setProgress(currentProgress);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isVideoLoaded]);

    // Handle progress bar click
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = (clickPosition / rect.width) * 100;

        if (videoRef.current && isVideoLoaded) {
            const newTime = (percentage / 100) * duration;
            videoRef.current.currentTime = newTime;
            setProgress(percentage);
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('Video loading error:', e);
        setIsLoading(false);
    };

    const toggleMute = () => {
        if (videoRef.current && isVideoLoaded) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Handle play button click - load video if not loaded yet
    const handlePlayClick = () => {
        if (!isVideoLoaded) {
            setIsLoading(true);
            // Set the src to trigger video loading
            if (videoRef.current) {
                videoRef.current.src = src;
                videoRef.current.load();
                
                // Listen for canplay event to know when video is ready
                const handleCanPlay = () => {
                    setIsVideoLoaded(true);
                    setIsLoading(false);
                    onPlayPause?.(true);
                };
                
                videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
            }
        } else {
            onPlayPause?.(!isPlaying);
        }
    };

    console.log('image-src:', coverUrl);
    
    return (
        <div className="relative w-full h-full">
            {/* Video element - only render when needed */}
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${videoClassName} ${!isVideoLoaded ? 'hidden' : ''}`}
                playsInline
                muted={isMuted}
                loop={false}
                controls={false}
                onEnded={onEnded}
                onError={handleError}
            >
                Your browser does not support the video tag.
            </video>

            {/* Cover - shown before video is loaded */}
            {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlayClick}>
                    {/* Fallback Background */}
                    <div className="absolute inset-0 bg-gray-100"></div>

                    {/* Cover Image */}
                    <img 
                        src={coverUrl} 
                        alt={title || 'Video cover'} 
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => {
                            // If cover image fails to load, fallback to default background
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    
                    {/* Play Button Overlay */}
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
                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => onPlayPause?.(!isPlaying)}>
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
                            toggleMute();
                        }}
                    >
                        {isMuted ? <IconVolumeOff size={24} /> : <IconVolume size={24} />}
                    </button>
                </>
            )}
        </div>
    );
};

export default VideoPlayer;
