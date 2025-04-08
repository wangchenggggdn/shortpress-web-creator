import React from 'react';
import { IconChevronUp } from '@tabler/icons-react';

/**
 * Props interface for VideoInfo component
 */
interface VideoInfoProps {
    /** Title of the video */
    title?: string;
    /** Description of the video */
    description?: string;
    /** Poster/thumbnail image URL */
    poster?: string;
    /** Callback function when watch full button is clicked */
    onWatchFull?: () => void;
    /** Callback function when title is clicked */
    onTitleClick?: () => void;
}

/**
 * Video information component
 * Displays video details with poster, title, description and watch full button
 * @returns React component with video information interface
 */
const VideoInfo: React.FC<VideoInfoProps> = ({ title, description, poster, onWatchFull, onTitleClick }) => {
    return (
        <>
            {/* Video Info Card */}
            <div className="flex items-end justify-center gap-3 mb-4">
                {poster && (
                    <div className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer" onClick={onTitleClick}>
                        <img src={poster} alt="video cover" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate cursor-pointer" onClick={onTitleClick}>
                        {`${title} >`}
                    </h3>
                </div>
            </div>

            <p className="text-white/80 text-xs truncate mt-1">{description}</p>

            {/* Watch Full Episodes Button */}
            <button
                onClick={onWatchFull}
                className="w-full mt-4 mb-2 py-2 px-4 bg-primary/20 hover:bg-primary/30 
                         rounded-full flex items-center justify-between 
                         text-white text-sm font-medium transition-colors"
            >
                <span>Watch Full Episodes ( 61 )</span>
                <IconChevronUp size={18} />
            </button>
        </>
    );
};

export default VideoInfo;
