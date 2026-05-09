import React, { useEffect, useState } from 'react';
import { IconX, IconChevronRight, IconArrowLeft, IconFile, IconLink, IconTrash, IconPlus, IconPhoto, IconLoader } from '@tabler/icons-react';
import { Section, DataSourceType, Widget, WidgetType, DataWidget, SectionType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import ContentTypeSelector from '../../common/ContentTypeSelector';
import { Menu, TextInput, ActionIcon, LoadingOverlay, Switch } from '@mantine/core';
import PlaylistData from './playlist-data';
import PlaylistSelector from '../../common/PlaylistSelector';
import PageSelector from '../../common/PageSelector';
import UrlInputSelector from '../../common/UrlInputSelector';
import { Playlist } from '@/types/playlist';
import useEditorStore from '@/store/useEditorStore';
import WebsiteApi from '@/api/website';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';

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
    const { currentSection, editWebsite, currentVersion } = useEditorStore();

    // Cover jump path states
    const [showCoverAddTypeMenu, setShowCoverAddTypeMenu] = useState(false);
    const [showCoverPageModal, setShowCoverPageModal] = useState(false);
    const [showCoverUrlModal, setShowCoverUrlModal] = useState(false);

    // Link path states (for Player)
    const [showLinkAddTypeMenu, setShowLinkAddTypeMenu] = useState(false);
    const [showLinkPageModal, setShowLinkPageModal] = useState(false);
    const [showLinkUrlModal, setShowLinkUrlModal] = useState(false);

    useEffect(() => {
        setSectionTitle(section.title || '');
    }, [section.title]);

    useEffect(() => {
        setShowPlaylistData(
            section.params.extend.widgets &&
                section.params.extend.widgets.length > 0 &&
                section.params.extend.widgets[0].data &&
                section.params.extend.widgets[0].data.length > 0 &&
                section.params.extend.dataSourceType === DataSourceType.PLAYLIST
        );
    }, [section.params.extend.widgets, section.params.extend.dataSourceType]);

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
            type === DataSourceType.PLAYLIST && setShowPlaylistAdd(true);
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
        switch (type) {
            case DataSourceType.NEW_RELEASE:
                return await getNewRelease();
            default:
                return [];
        }
    };

    const getNewRelease = async () => {
        const res = await WebsiteApi.getNewRelease(editWebsite?.id as string);
        return res?.data ?? [];
    };

    const handleAddPlaylistItem = (playlists: Playlist[]) => {
        updateWidgetDataToSection(playlists);
    };

    const updateWidgetDataToSection = (playlists: Playlist[]) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const contentItem = widgets[0];
        if (contentItem) {
            // 直接替换数据
            contentItem.data = playlists;
        }
        if (playlists.length > 0) {
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

    // Cover jump path handlers
    const handleAddCoverPageItem = (pageId: string, pageName: string, path: string) => {
        updateSection({
            coverLink: {
                id: createUniqueUUID([]),
                label: pageName,
                content: 'page',
                type: WidgetType.PATH,
                path: path,
            },
        });
        setShowCoverPageModal(false);
    };

    const handleAddCoverUrlItem = (url: string) => {
        updateSection({
            coverLink: {
                id: createUniqueUUID([]),
                label: url,
                content: 'url',
                type: WidgetType.PATH,
                path: url,
            },
        });
        setShowCoverUrlModal(false);
    };

    // Link path handlers
    const handleAddLinkPageItem = (pageId: string, pageName: string, path: string) => {
        updateSection({
            link: {
                id: createUniqueUUID([]),
                label: pageName,
                content: 'page',
                type: WidgetType.PATH,
                path: path,
            },
        });
        setShowLinkPageModal(false);
    };

    const handleAddLinkUrlItem = (url: string) => {
        updateSection({
            link: {
                id: createUniqueUUID([]),
                label: url,
                content: 'url',
                type: WidgetType.PATH,
                path: url,
            },
        });
        setShowLinkUrlModal(false);
    };

    // Example Images Upload Logic for Template Create
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

    const handleExampleImageClick = (index: number) => {
        setActiveUploadIndex(index);
        fileInputRef.current?.click();
    };

    const handleExampleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || activeUploadIndex === null) return;

        setUploadingIndex(activeUploadIndex);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await CreatorApi.uploadFile(formData);
            if (res.code === 0 && res.data) {
                const imageUrl = res.data;
                const newImages = [...(section.params.extend.exampleImages || [])];
                // Ensure array has enough slots
                while (newImages.length <= activeUploadIndex) {
                    newImages.push('');
                }
                newImages[activeUploadIndex] = imageUrl;

                updateSection({
                    params: {
                        ...section.params,
                        extend: {
                            ...section.params.extend,
                            exampleImages: newImages,
                        },
                    },
                });
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload error');
        } finally {
            setUploadingIndex(null);
            setActiveUploadIndex(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteExampleImage = (index: number) => {
        const newImages = [...(section.params.extend.exampleImages || [])];
        newImages.splice(index, 1);
        // Clean up empty strings at the end if strict list is needed, but here we just remove the item

        updateSection({
            params: {
                ...section.params,
                extend: {
                    ...section.params.extend,
                    exampleImages: newImages,
                },
            },
        });
    };

    const contentItem = getContentItem();
    const isPlaylistType = section.params.extend.dataSourceType === DataSourceType.PLAYLIST;

    return (
        <>
            <div className="p-4 h-full overflow-y-auto text-purple-black">
                {
                    <div>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={onBack} className="text-gray-400">
                                <IconArrowLeft size={20} />
                            </button>
                            <h2 className="text-[20px] font-semibold text-black-purple">{section.title}</h2>
                        </div>

                        {/* Info Message */}
                        <div className="mb-4 text-sm text-gray-500">
                            <p>{section.type + ' Section'}</p>
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

                        {/* Example Images for Template Create */}
                        {(section.type === SectionType.TEMPLATE_CREATE || section.type === SectionType.CREATE) && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-black-purple mb-2">Example Images (Max 4)</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {(section.params.extend.exampleImages || []).map((img, index) => (
                                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                                            {img &&
                                                (img.toLowerCase().includes('.webm') ? (
                                                    <video src={img} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                                ) : (
                                                    <img src={img} alt={`Example ${index}`} className="w-full h-full object-cover" />
                                                ))}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <button
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleDeleteExampleImage(index);
                                                    }}
                                                    className="p-1 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                                                >
                                                    <IconTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!section.params.extend.exampleImages || section.params.extend.exampleImages.length < 4) && (
                                        <button
                                            onClick={() => handleExampleImageClick((section.params.extend.exampleImages || []).length)}
                                            disabled={uploadingIndex !== null}
                                            className="aspect-square flex items-center justify-center rounded-lg border border-dashed border-gray-300 hover:bg-gray-50 transition-colors relative bg-white"
                                        >
                                            {uploadingIndex === (section.params.extend.exampleImages || []).length ? (
                                                <IconLoader className="animate-spin text-gray-400" size={20} />
                                            ) : (
                                                <IconPlus className="text-gray-400" size={24} />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleExampleImageFileChange} />
                            </div>
                        )}

                        {/* Cover jump path */}
                        {section.type !== SectionType.TEMPLATE_CREATE && section.type !== SectionType.CREATE && section.type !== SectionType.PLAYER && (
                            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[15px] font-medium text-black-purple">Cover jump path</h3>
                                    {!section.coverLink && (
                                        <Menu opened={showCoverAddTypeMenu} onChange={setShowCoverAddTypeMenu}>
                                            <Menu.Target>
                                                <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">Add Path</button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconFile size={16} />}
                                                    onClick={() => {
                                                        setShowCoverAddTypeMenu(false);
                                                        setShowCoverPageModal(true);
                                                    }}
                                                >
                                                    Page
                                                    <div className="text-xs text-gray-500">Link directly to another page</div>
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconLink size={16} />}
                                                    onClick={() => {
                                                        setShowCoverAddTypeMenu(false);
                                                        setShowCoverUrlModal(true);
                                                    }}
                                                >
                                                    URL
                                                    <div className="text-xs text-gray-500">Link an external resource</div>
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    )}
                                </div>

                                {section.coverLink && (
                                    <div className="mt-2 flex items-center justify-between py-2 px-3 bg-white border border-gray-200 rounded">
                                        <div>{section.coverLink.label}</div>
                                        <ActionIcon variant="subtle" color="red" onClick={() => updateSection({ coverLink: undefined })}>
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Player Link Path */}
                        {section.type === SectionType.PLAYER && (
                            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[15px] font-medium text-black-purple">Jump Path</h3>
                                    {!section.link && (
                                        <Menu opened={showLinkAddTypeMenu} onChange={setShowLinkAddTypeMenu}>
                                            <Menu.Target>
                                                <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">Add Path</button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconFile size={16} />}
                                                    onClick={() => {
                                                        setShowLinkAddTypeMenu(false);
                                                        setShowLinkPageModal(true);
                                                    }}
                                                >
                                                    Page
                                                    <div className="text-xs text-gray-500">Link directly to another page</div>
                                                </Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconLink size={16} />}
                                                    onClick={() => {
                                                        setShowLinkAddTypeMenu(false);
                                                        setShowLinkUrlModal(true);
                                                    }}
                                                >
                                                    URL
                                                    <div className="text-xs text-gray-500">Link an external resource</div>
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    )}
                                </div>

                                {section.link && (
                                    <div className="mt-2 flex items-center justify-between py-2 px-3 bg-white border border-gray-200 rounded">
                                        <div>{section.link.label}</div>
                                        <ActionIcon variant="subtle" color="red" onClick={() => updateSection({ link: undefined })}>
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-black-purple">Disable Playlist Detail Link</span>
                                    <Switch
                                        checked={section.params.extend.disablePlaylistLink || false}
                                        onChange={event => {
                                            updateSection({
                                                params: {
                                                    ...section.params,
                                                    extend: {
                                                        ...section.params.extend,
                                                        disablePlaylistLink: event.currentTarget.checked,
                                                    },
                                                },
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        {section.type !== SectionType.TEMPLATE_CREATE && section.type !== SectionType.CREATE && section.type !== SectionType.PLAYER && (
                            <div className="mb-4">
                                <div className="text-sm text-purple-black font-medium mb-3">Content</div>
                                {contentItem ? (
                                    !showPlaylistData && (
                                        <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                            {/* Content Type Display */}
                                            <div className="bg-white flex items-center justify-between cursor-pointer">
                                                <span className="text-base text-[#1E293B] lowercase first-letter:uppercase">{contentItem.label}</span>
                                            </div>

                                            {/* Add Button */}
                                            {isPlaylistType && (
                                                <button
                                                    onClick={() => setShowPlaylistAdd(true)}
                                                    className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal"
                                                >
                                                    Add Playlists
                                                </button>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div>
                                        <Menu>
                                            <Menu.Target>
                                                <button className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base font-normal">
                                                    Add Content
                                                </button>
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
                        )}
                    </div>
                }
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
            <PlaylistSelector
                key={'normal-editor-playlist-selector'}
                isOpen={showPlaylistAdd}
                onClose={() => setShowPlaylistAdd(false)}
                onAdd={handleAddPlaylistItem}
                siteId={editWebsite?.id as string}
                selectedPlaylists={(contentItem as DataWidget)?.data || []}
            />

            {/* Cover jump path modals */}
            <PageSelector open={showCoverPageModal} onClose={() => setShowCoverPageModal(false)} pages={currentVersion?.pages || []} onSelect={handleAddCoverPageItem} />

            <UrlInputSelector open={showCoverUrlModal} onClose={() => setShowCoverUrlModal(false)} onSelect={handleAddCoverUrlItem} />

            {/* Link path modals */}
            <PageSelector open={showLinkPageModal} onClose={() => setShowLinkPageModal(false)} pages={currentVersion?.pages || []} onSelect={handleAddLinkPageItem} />
            <UrlInputSelector open={showLinkUrlModal} onClose={() => setShowLinkUrlModal(false)} onSelect={handleAddLinkUrlItem} />
        </>
    );
};

export default NormalEditor;
