import React, { useState } from 'react';
import { IconX, IconChevronRight } from '@tabler/icons-react';
import { Section, DataSourceType, Widget, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import ContentTypeSelector from '../../common/ContentTypeSelector';
import { Menu } from '@mantine/core';
import PlaylistData from './playlist-data';
import PlaylistSelector from '../../common/PlaylistSelector';
import { Playlist } from '@/types/playlist';

interface NormalEditorProps {
    section: Section;
    onBack: () => void;
    updateSection: (updates: Partial<Section>) => void;
}

const MENU_TYPES = {
    CONTENT: 'content'
} as const;

const NormalEditor: React.FC<NormalEditorProps> = ({ section, onBack, updateSection }) => {
    const [showContentSelector, setShowContentSelector] = useState(false);
    const [showPlaylistData, setShowPlaylistData] = useState(false);
    const [showPlaylistAdd, setShowPlaylistAdd] = useState(false);

    const getContentItem = (): Widget | undefined => {
        return section.params.extend.widgets?.find(item => item.content === MENU_TYPES.CONTENT);
    };

    const handleContentTypeSelect = (type: DataSourceType) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const contentItem = widgets.find(item => item.content === MENU_TYPES.CONTENT);
        
        if (contentItem) {
            contentItem.label = type;
        } else {
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: type,
                content: MENU_TYPES.CONTENT,
                visible: true,
                type: WidgetType.DATA
            });
        }
        
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    dataSourceType: type,
                    widgets
                }
            }
        });
        
        setShowContentSelector(false);
    };

    const handleAddPlaylistItem = (playlists:Playlist[]) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const contentItem = widgets[0];
        if (contentItem) {
            contentItem.data = playlists;
        }
        updateSection({
            params: {
                ...section.params,
                extend: {
                    ...section.params.extend,
                    widgets
                }
            }
        });
    };

    const contentItem = getContentItem();
    const isPlaylistType = section.params.extend.dataSourceType === DataSourceType.PLAYLIST;

    return (
        <>
           <div className="p-4 h-full overflow-y-auto">
                {!showPlaylistData && 
                    <div>
                                        {/* Header */}
                                        <div className="flex items-center justify-end mb-2">
                                <button
                                    onClick={onBack}
                                    className="p-1.5 hover:bg-gray-100 rounded"
                                >
                                    <IconX size={18} />
                                </button>
                            </div>

                            {/* Section Title */}
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-[#1E293B] capitalize">{section.type} Section</h1>
                                <h2 className="text-lg text-[#64748B] mt-1 capitalize">{section.type} Section</h2>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="text-xl text-[#94A3B8] mb-3">Content</h3>
                                {contentItem ? (
                                    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                        {/* Content Type Display */}
                                        <div 
                                            className="bg-white flex items-center justify-between cursor-pointer"
                                            onClick={() => isPlaylistType && setShowPlaylistData(true)}
                                        >
                                            <span className="text-base text-[#1E293B] lowercase first-letter:uppercase">{contentItem.label}</span>
                                            {isPlaylistType && <IconChevronRight className="text-gray-400" size={20} />}
                                        </div>
                                        
                                        {/* Add Button */}
                                        {isPlaylistType && (
                                            <button
                                                onClick={() => setShowPlaylistData(true)}
                                                className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal"
                                            >
                                                Add Playlists
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <Menu>
                                            <Menu.Target>
                                                <button
                                                    className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal"
                                                >
                                                    Add Content
                                                </button>
                                            </Menu.Target>
                                            <ContentTypeSelector
                                                sectionType={section.type}
                                                onSelect={handleContentTypeSelect}
                                            />
                                        </Menu>
                                    </div>
                                )}
                            </div>

                    </div>
                }
                {/* Playlist Data Modal */}
                {showPlaylistData && (
                    <PlaylistData widgets={section.params.extend.widgets || []} onClose={() => setShowPlaylistData(false)} addContent={() => {
                        setShowPlaylistAdd(true);
                    }} />
                )}
            </div>
             <PlaylistSelector
                    open={showPlaylistAdd}
                    onClose={() => setShowPlaylistAdd(false)}
                    onSelect={handleAddPlaylistItem}
            />
        </>
    );
};

export default NormalEditor; 