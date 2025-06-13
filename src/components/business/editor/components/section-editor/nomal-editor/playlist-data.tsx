import React from 'react';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { DataWidget, Widget } from '@/types/editor';

interface PlaylistDataProps {
    widgets: DataWidget[];
    onClose: () => void;
    addContent: () => void;
}

const PlaylistData: React.FC<PlaylistDataProps> = ({ widgets, onClose, addContent }) => {
    // Mock data for demonstration
    const playlists = widgets[0]?.data??[];

    return (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-gray-200">
                    <button onClick={onClose} className="text-[#6366F1] flex items-center gap-1 text-sm">
                        ← Sections
                    </button>
                    <h1 className="text-xl font-bold text-[#1E293B] ml-4">Carousel Data</h1>
                </div>

                {/* Subtitle */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg text-[#64748B]">Carousel Data</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <h3 className="text-lg text-[#94A3B8] mb-4">Data</h3>
                    
                    <div className="space-y-2">
                        {playlists.map((playlist: any, index: number) => (
                            <div 
                                key={index}
                                className="flex items-center gap-3 p-2 bg-[#EEF2FF] rounded-lg"
                            >
                                <IconGripVertical className="text-gray-400 cursor-move" size={20} />
                                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                                <span className="flex-1 text-[#1E293B]">{playlist.title}</span>
                                <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <IconTrash size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base" onClick={addContent}>
                        Add Content
                    </button>
                </div>
            </div>
    );
};

export default PlaylistData; 