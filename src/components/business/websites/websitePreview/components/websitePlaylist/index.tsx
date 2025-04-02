import React from 'react';
import { IconChevronLeft } from '@tabler/icons-react';

interface Episode {
    id: string;
    title: string;
    episode: number;
    isWatched?: boolean;
    isPlaying?: boolean;
}

interface WebsitePlaylistProps {
    title: string;
    cover: string;
    totalEpisodes: number;
    synopsis: string;
    episodes: Episode[];
    currentEpisode?: number;
    onBack?: () => void;
    onEpisodeClick?: (episode: number) => void;
    onContinueWatching?: () => void;
}

const WebsitePlaylistApp: React.FC<WebsitePlaylistProps> = ({ title, cover, totalEpisodes, synopsis, episodes, currentEpisode, onBack, onEpisodeClick, onContinueWatching }) => {
    return (
        <div className="min-h-screen bg-black text-white min-w-[260px] md:max-w-[260px] lg:max-w-[360px]">
            {/* Status Bar */}
            <button onClick={onBack} className="text-white">
                <div className="flex items-center px-4 pt-6 bg-black/80">
                    <IconChevronLeft size={20} />
                    <span className="ml-1 text-sm">Home</span>
                </div>
            </button>

            {/* Series Information */}
            <div className="px-4 py-6">
                <div className="flex gap-4">
                    <img src={cover} alt={title} className="w-24 h-32 rounded-lg object-cover" />
                    <div>
                        <h1 className="text-lg font-bold">{title}</h1>
                        <p className="text-xs text-gray-400 mt-1">{totalEpisodes} Episodes</p>
                    </div>
                </div>

                {/* Synopsis */}
                <div className="mt-6">
                    <h2 className="text-base mb-2">Synopsis</h2>
                    <p className="text-xs text-gray-400">{synopsis}</p>
                </div>
            </div>

            {/* Episode List */}
            <div className="px-4 py-6">
                <h2 className="text-base mb-4">Episode List ({totalEpisodes})</h2>
                <div className="grid grid-cols-5 gap-2">
                    {episodes.map(ep => (
                        <button
                            key={ep.id}
                            onClick={() => onEpisodeClick?.(ep.episode)}
                            className={`
                                p-2 rounded-lg text-center text-xs
                                ${ep.isPlaying ? 'bg-primary' : 'bg-gray-800'}
                                ${ep.isWatched ? 'text-gray-400' : 'text-white'}
                            `}
                        >
                            EP {ep.episode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                {currentEpisode ? (
                    <button onClick={onContinueWatching} className="w-full py-3 bg-primary rounded-full text-white text-sm font-medium flex items-center justify-center gap-2">
                        Continue Watching EP {currentEpisode}
                        <IconChevronLeft className="rotate-180" size={18} />
                    </button>
                ) : (
                    <button
                        onClick={() => onEpisodeClick?.(1)}
                        className="w-full py-3 bg-primary rounded-full text-white text-sm font-medium flex items-center justify-center gap-2"
                    >
                        Start watching EP 1
                        <IconChevronLeft className="rotate-180" size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default WebsitePlaylistApp;
