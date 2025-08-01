'use client';

import React from 'react';
import { IVideo } from '@/types/video';

/**
 * Props interface for SubtitlesManager component
 */
interface SubtitlesManagerProps {
    /** Video data containing subtitles */
    video: IVideo;
    /** Callback function when subtitles are updated */
    onSubtitlesChange: (subtitles: IVideo['subtitles']) => void;
    /** Callback function to open subtitles modal */
    onOpenSubtitlesModal: () => void;
}

/**
 * Subtitles manager component
 * Displays existing subtitle files and provides add/delete functionality
 * @returns React component for managing video subtitles
 */
const SubtitlesManager: React.FC<SubtitlesManagerProps> = ({ 
    video, 
    onSubtitlesChange, 
    onOpenSubtitlesModal 
}) => {
    /**
     * Handle subtitle deletion
     * @param lang Language code of subtitle to delete
     */
    const handleDeleteSubtitle = (lang: string) => {
        if (video.subtitles) {
            const newSubtitles = { ...video.subtitles };
            delete newSubtitles[lang];
            onSubtitlesChange(newSubtitles);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-2">Subtitles</label>
            <div className="space-y-3">
                {/* Existing subtitle files */}
                {video.subtitles && Object.keys(video.subtitles).length > 0 && (
                    <div className="space-y-2">
                        {Object.entries(video.subtitles).map(([lang, subtitle]) => (
                            <div key={lang} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-700">
                                    {lang} {subtitle.desc}
                                </span>
                                <button
                                    onClick={() => handleDeleteSubtitle(lang)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete subtitle"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Add Subtitles button */}
                <button
                    onClick={onOpenSubtitlesModal}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-700">Add Subtitles</span>
                </button>
            </div>
        </div>
    );
};

export default SubtitlesManager; 