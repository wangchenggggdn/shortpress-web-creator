import React, { useEffect, useState } from 'react';
import { IconX, IconChevronRight, IconArrowLeft } from '@tabler/icons-react';
import { Section, DataSourceType, Widget, WidgetType, DataWidget, SectionType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import ContentTypeSelector from '../../common/ContentTypeSelector';
import { Menu, TextInput } from '@mantine/core';
import PlaylistData from './playlist-data';
import PlaylistSelector from '../../common/PlaylistSelector';
import { Playlist } from '@/types/playlist';
import useEditorStore from '@/store/useEditorStore';
import WebsiteApi from '@/api/website';

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
    const { currentSection,editWebsite } = useEditorStore();

    useEffect(() => {
        setSectionTitle(section.title || '');
    }, [section.title]);


    useEffect(() => {
        setShowPlaylistData(section.params.extend.widgets&&section.params.extend.widgets.length>0&&section.params.extend.widgets[0].data&&section.params.extend.widgets[0].data.length>0&&section.params.extend.dataSourceType===DataSourceType.PLAYLIST);
    }, [section.params.extend.widgets,section.params.extend.dataSourceType]);

    const getContentItem = (): Widget | undefined => {
        return section.params.extend.widgets?.find(item => item.content === MENU_TYPES.CONTENT);
    };

    const handleContentTypeSelect = async (type: DataSourceType) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const contentItem = widgets.find(item => item.content === MENU_TYPES.CONTENT);

        if (contentItem) {
            contentItem.label = type;
        } else {
            const dataNew: Playlist[] = await getDataSourceData(type);
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: type,
                content: MENU_TYPES.CONTENT,
                visible: true,
                type: WidgetType.DATA,
                data: dataNew,
            });
            setShowPlaylistAdd(true);
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

    const getDataSourceData = async (type: DataSourceType) => {
        switch(type){
            case DataSourceType.NEW_RELEASE:
                return await getNewRelease();
            default:
                return [];
        }
    }

    const getNewRelease = async () => {
        const res = await WebsiteApi.getNewRelease(editWebsite?.id as string);
        return res?.data??[];
    }

    const handleAddPlaylistItem = (playlists: Playlist[]) => {
        updateWidgetDataToSection(playlists);
    };

    const updateWidgetDataToSection = (playlists: Playlist[]) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const contentItem = widgets[0];
        if (contentItem) {
            contentItem.data = playlists;
        }
        if(playlists.length>0){
            setShowPlaylistData(true);
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
                {(
                    <div>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={onBack} className="text-gray-400">
                                <IconArrowLeft size={20} />
                            </button>
                            <h2 className="text-[20px] font-semibold text-black-purple">{section.title}</h2>
                        </div>

                        {/* Info Message */}
                        <div className="mb-6 text-sm text-gray-500">
                            <p>{section.type+' Section'}</p>
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
                                !showPlaylistData&& <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                     {/* Content Type Display */}
                                     <div className="bg-white flex items-center justify-between cursor-pointer">
                                         <span className="text-base text-[#1E293B] lowercase first-letter:uppercase">{contentItem.label}</span>
                                     </div>
 
                                     {/* Add Button */}
                                     {isPlaylistType && (
                                         <button
                                             onClick={() =>  setShowPlaylistAdd(true)}
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
                                             <button className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal">Add Content</button>
                                         </Menu.Target>
                                         <ContentTypeSelector sectionType={section.type} onSelect={handleContentTypeSelect} />
                                     </Menu>
                                 </div>
                             )}
                           
                  
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
                    </div>
                )}
                {/* Playlist Data Modal */}
                {/* {showPlaylistData && (
                    <PlaylistData
                        widgets={section.params.extend.widgets || []}
                        onClose={() => setShowPlaylistData(false)}
                        addContent={() => {
                            setShowPlaylistAdd(true);
                        }}
                        updateWidgetDataToSection={updateWidgetDataToSection}
                    />
                )} */}
            </div>
            <PlaylistSelector key={'normal-editor-playlist-selector'} open={showPlaylistAdd} isMultiSelect={true} onClose={() => setShowPlaylistAdd(false)} onSelect={handleAddPlaylistItem} />
        </>
    );
};

export default NormalEditor;
