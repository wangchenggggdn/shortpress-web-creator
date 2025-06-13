import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { Section, DataSourceType, Widget, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

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
                    widgets
                }
            }
        });
        
        setShowContentSelector(false);
    };

    const contentItem = getContentItem();

    return (
        <div className="p-4 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 rounded"
                >
                    <IconX size={20} />
                </button>
                <h2 className="text-lg font-medium">Carousel Section</h2>
            </div>

            {/* Content */}
            <div className="mb-6">
                <h3 className="font-medium mb-4">Content</h3>
                {contentItem ? (
                    <div>
                        {/* Content type specific UI will go here */}
                        <div className="text-gray-500">
                            Content editor for {contentItem.label} is under development
                        </div>
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setShowContentSelector(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Add Content
                        </button>

                        {showContentSelector && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                                <div className="space-y-4">
                                    <button
                                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg"
                                        onClick={() => handleContentTypeSelect(DataSourceType.PLAYLIST)}
                                    >
                                        <div className="font-medium">Playlist</div>
                                        <div className="text-sm text-gray-500">Add existing playlists to section</div>
                                    </button>
                                    <button
                                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg"
                                        onClick={() => handleContentTypeSelect(DataSourceType.CONTINUE_WATCHING)}
                                    >
                                        <div className="font-medium">Continue Watching</div>
                                        <div className="text-sm text-gray-500">Display the most recently watched for the user</div>
                                    </button>
                                    <button
                                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg"
                                        onClick={() => handleContentTypeSelect(DataSourceType.NEW_RELEASE)}
                                    >
                                        <div className="font-medium">New Release</div>
                                        <div className="text-sm text-gray-500">Display the most recently released playlists</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NormalEditor; 