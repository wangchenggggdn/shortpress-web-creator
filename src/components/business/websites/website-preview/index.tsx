import React, { useState, useEffect } from 'react';
import { Swiper } from 'antd-mobile';
import { IVideo } from '@/types/video';
import WebsiteVideoPlayer from './components/websiteVideoPlayer/websiteVideoPlayer';
import WebsitePlaylistApp from './components/websitePlaylist';
import EpisodeSheet from './components/episodeSheet/episodeSheet';

/**
 * Props interface for WebsitePreview component
 */
interface WebsitePreviewProps {
    /** Array of videos to display */
    playlist?: IVideo[];
    /** Callback function to load more videos */
    onLoadMore?: () => void;
}

/**
 * Website preview component
 * Displays videos in a mobile-like interface with playlist and episode management
 * @returns React component with video preview interface
 */
const WebsitePreview: React.FC<WebsitePreviewProps> = ({ playlist = [], onLoadMore }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [showEpisodeSheet, setShowEpisodeSheet] = useState(false);

    // Load more videos when approaching the end of the playlist
    useEffect(() => {
        if (onLoadMore && playlist.length > 0 && currentIndex >= playlist.length - 3) {
            onLoadMore();
        }
    }, [currentIndex, playlist.length, onLoadMore]);

    /**
     * Handle video index change
     * @param index New video index
     */
    const handleChange = (index: number) => {
        setIsPlaying(true);
        setCurrentIndex(index);
    };

    /**
     * Handle title or cover click to show playlist
     */
    const handleTitleClick = () => {
        setShowPlaylist(true);
    };

    /**
     * Handle back button click to return to preview
     */
    const handleBack = () => {
        setShowPlaylist(false);
    };

    /**
     * Handle episode selection
     * @param episode Episode number to play
     */
    const handleEpisodeClick = (episode: number) => {
        setCurrentIndex(episode - 1);
        setShowPlaylist(false);
        setIsPlaying(true);
    };

    /**
     * Handle "Watch Full Episodes" button click
     */
    const handleWatchFull = () => {
        setShowEpisodeSheet(true);
    };

    const currentVideo = playlist[currentIndex];

    return (
        <div className="w-full h-full bg-black rounded-[32px] shadow-lg overflow-hidden relative">
            {showPlaylist ? (
                <WebsitePlaylistApp
                    title={currentVideo?.title || ''}
                    cover={currentVideo?.cover || ''}
                    totalEpisodes={playlist.length}
                    synopsis={currentVideo?.description || ''}
                    episodes={playlist.map((video, index) => ({
                        id: video.vid,
                        title: video.title,
                        episode: index + 1,
                        isPlaying: index === currentIndex,
                        isWatched: false, // Add watch status logic here
                    }))}
                    currentEpisode={currentIndex + 1}
                    onBack={handleBack}
                    onEpisodeClick={handleEpisodeClick}
                    onContinueWatching={() => {
                        setShowPlaylist(false);
                        setIsPlaying(true);
                    }}
                />
            ) : (
                <>
                    {/* Status Bar */}
                    <div className="w-full h-[5%] min-h-[32px] bg-black/80 flex items-center justify-between px-4 absolute top-0 z-10">
                        <div className="text-white text-xs">9:30</div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-white rounded-full" />
                            <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                    </div>

                    {/* Video Swiper */}
                    <Swiper
                        style={{ height: '100%' }}
                        direction="vertical"
                        loop={false}
                        slideSize={100}
                        trackOffset={0}
                        defaultIndex={0}
                        onIndexChange={handleChange}
                        indicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}
                    >
                        {playlist.map((video, index) => (
                            <Swiper.Item key={video.vid + 'swiper' + index}>
                                <WebsiteVideoPlayer
                                    src={video.videoSourceUrl ?? ''}
                                    poster={video.cover ?? ''}
                                    isPlaying={isPlaying && currentIndex === index}
                                    onEnded={() => setIsPlaying(false)}
                                    title={video.title}
                                    description={video.description}
                                    onPlayPause={setIsPlaying}
                                    // onTitleClick={handleTitleClick}
                                    // onWatchFull={handleWatchFull}
                                />
                            </Swiper.Item>
                        ))}
                    </Swiper>

                    {/* Episode Sheet */}
                    <EpisodeSheet
                        visible={showEpisodeSheet}
                        onClose={() => setShowEpisodeSheet(false)}
                        title={currentVideo?.title || ''}
                        totalEpisodes={playlist.length}
                        episodes={playlist.map((video, index) => ({
                            id: video.vid,
                            title: video.title,
                            episode: index + 1,
                            isPlaying: index === currentIndex,
                            isWatched: false,
                        }))}
                        currentEpisode={currentIndex + 1}
                        onEpisodeClick={episode => {
                            setCurrentIndex(episode - 1);
                            setIsPlaying(true);
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default WebsitePreview;
