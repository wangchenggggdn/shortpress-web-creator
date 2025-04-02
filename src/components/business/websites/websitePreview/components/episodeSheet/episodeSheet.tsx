import React from 'react';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * Interface for episode data
 */
interface Episode {
    /** Unique identifier for the episode */
    id: string;
    /** Title of the episode */
    title: string;
    /** Episode number */
    episode: number;
    /** Whether the episode has been watched */
    isWatched?: boolean;
    /** Whether the episode is currently playing */
    isPlaying?: boolean;
}

/**
 * Props interface for EpisodeSheet component
 */
interface EpisodeSheetProps {
    /** Whether the sheet is visible */
    visible: boolean;
    /** Callback function when sheet is closed */
    onClose: () => void;
    /** Title of the playlist/series */
    title: string;
    /** Total number of episodes */
    totalEpisodes: number;
    /** Array of episode data */
    episodes: Episode[];
    /** Currently playing episode number */
    currentEpisode?: number;
    /** Callback function when an episode is clicked */
    onEpisodeClick?: (episode: number) => void;
}

/**
 * Episode sheet component
 * Displays a bottom sheet with episode list and playback controls
 * @returns React component with episode selection interface
 */
const EpisodeSheet: React.FC<EpisodeSheetProps> = ({ visible, onClose, title, totalEpisodes, episodes, currentEpisode, onEpisodeClick }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 z-30
                    ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`absolute left-0 right-0 bottom-0 bg-black rounded-t-2xl transition-transform duration-300 z-40 h-[60%]
                    ${visible ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="flex flex-col h-full text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div>
                            <h3 className="text-sm font-medium">{title}</h3>
                            <p className="text-xs text-gray-400 mt-1">Episode List ({totalEpisodes})</p>
                        </div>
                        <button onClick={onClose} className="p-2">
                            <IconChevronDown size={20} />
                        </button>
                    </div>

                    {/* Episode Grid */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="grid grid-cols-5 gap-2">
                            {episodes.map((ep, index) => (
                                <button
                                    key={ep.id + 'episode' + index}
                                    onClick={() => {
                                        onEpisodeClick?.(ep.episode);
                                        onClose();
                                    }}
                                    className={`
                                        p-2 rounded-lg text-center text-xs
                                        ${ep.isPlaying ? 'bg-primary' : 'bg-gray-800'}
                                        ${ep.isWatched ? 'text-gray-400' : 'text-white'}
                                        hover:bg-primary/80 transition-colors
                                    `}
                                >
                                    EP {ep.episode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EpisodeSheet;
