import React, { useEffect, useState } from 'react';
import { IconX, IconChevronRight } from '@tabler/icons-react';
import { Section, DataSourceType, Widget, WidgetType, DataWidget, SectionType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import ContentTypeSelector from '../../common/ContentTypeSelector';
import { Menu, TextInput } from '@mantine/core';
import PlaylistData from './playlist-data';
import PlaylistSelector from '../../common/PlaylistSelector';
import { Playlist } from '@/types/playlist';
import useEditorStore from '@/store/useEditorStore';

interface NormalEditorProps {
    section: Section;
    onBack: () => void;
    updateSection: (updates: Partial<Section>) => void;
}

const MENU_TYPES = {
    CONTENT: 'content',
} as const;

const NormalEditor: React.FC<NormalEditorProps> = ({ section, onBack, updateSection }) => {
    const [showContentSelector, setShowContentSelector] = useState(false);
    const [showPlaylistData, setShowPlaylistData] = useState(false);
    const [showPlaylistAdd, setShowPlaylistAdd] = useState(false);
    const [sectionTitle, setSectionTitle] = useState(section.title || '');
    const { currentSection } = useEditorStore();

    useEffect(() => {
        setSectionTitle(section.title || '');
    }, [section.title]);

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
                type: WidgetType.DATA,
            });
        }

        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    dataSourceType: type,
                    widgets,
                },
            },
        });

        setShowContentSelector(false);
    };

    const handleAddPlaylistItem = (playlists: Playlist[]) => {
        updateWidgetDataToSection(playlists);
    };

    const updateWidgetDataToSection = (playlists: Playlist[]) => {
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
                    widgets,
                },
            },
        });
    };

    const handleTitleChange = (value: string) => {
        setSectionTitle(value);
        updateSection({
            ...section,
            title: value,
        });
    };

    const contentItem = getContentItem();
    const isPlaylistType = section.params.extend.dataSourceType === DataSourceType.PLAYLIST;

    return (
        <>
            <div className="p-4 h-full overflow-y-auto text-purple-black">
                {!showPlaylistData && (
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-end mb-2">
                            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded">
                                <IconX size={18} />
                            </button>
                        </div>

                        <div>
                            <h1 className="text-lg font-medium  mb-2">{section.title}</h1>
                            <h1 className="text-sm font-medium  mb-2">{section.type}</h1>
                        </div>

                        {/* Section Title */}
                        {section.type !== SectionType.FEATURE && section.type !== SectionType.CAROUSEL && (
                            <div className="mb-4">
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h1 className="text-base font-medium mb-2">{'Headline'}</h1>
                                    <TextInput
                                        value={sectionTitle}
                                        onChange={event => handleTitleChange(event.currentTarget.value)}
                                        placeholder="Enter section title"
                                        className="w-full"
                                        styles={{
                                            input: {
                                                border: '1px solid #E2E8F0', // 1. 加上一个细边框会更好看
                                                borderRadius: '8px', // 2. 加上圆角
                                                backgroundColor: '#F1F5F9', // 3. 修改背景色
                                                fontSize: '1.125rem',
                                                // padding: '0.5rem 0.75rem', // 4. 建议使用合适的 padding
                                                color: '#64748B',
                                                '&::placeholder': {
                                                    color: '#94A3B8',
                                                },
                                                // 5. 添加 :focus 状态的样式，提升用户体验
                                                '&:focus': {
                                                    borderColor: '#2563EB', // 聚焦时边框变色
                                                    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)', // 聚焦时显示光晕
                                                },
                                            },
                                            // wrapper 通常不需要修改，除非有特殊布局需求
                                            // wrapper: {
                                            //     border: 'none'
                                            // }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="mb-4">
                            <h3 className="text-xl text-[#94A3B8] mb-3">Content</h3>
                            {contentItem ? (
                                <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                    {/* Content Type Display */}
                                    <div className="bg-white flex items-center justify-between cursor-pointer" onClick={() => isPlaylistType && setShowPlaylistData(true)}>
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
                                            <button className="px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal">Add Content</button>
                                        </Menu.Target>
                                        <ContentTypeSelector sectionType={section.type} onSelect={handleContentTypeSelect} />
                                    </Menu>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Playlist Data Modal */}
                {showPlaylistData && (
                    <PlaylistData
                        widgets={section.params.extend.widgets || []}
                        onClose={() => setShowPlaylistData(false)}
                        addContent={() => {
                            setShowPlaylistAdd(true);
                        }}
                        updateWidgetDataToSection={updateWidgetDataToSection}
                    />
                )}
            </div>
            <PlaylistSelector open={showPlaylistAdd} isMultiSelect={true} onClose={() => setShowPlaylistAdd(false)} onSelect={handleAddPlaylistItem} />
        </>
    );
};

export default NormalEditor;
