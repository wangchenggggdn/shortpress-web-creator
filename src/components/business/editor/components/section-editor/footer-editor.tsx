import React, { useState } from 'react';
import { IconArrowLeft, IconExclamationCircle, IconPlus, IconPlaylist, IconFile, IconLink } from '@tabler/icons-react';
import { Section, Widget, WidgetType, PathWidget } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import WidgetPageItem from '../common/WidgetPageItem';
import InputModal from '@/components/common/input-modal';
import { IconMenuItem, LabelMenuItem } from '../common/menu-items';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Menu } from '@mantine/core';
import PlaylistSelector from '../common/PlaylistSelector';
import PageSelector from '../common/PageSelector';
import UrlInputSelector from '../common/UrlInputSelector';
import useEditorStore from '@/store/useEditorStore';

interface FooterEditorProps {
    section: Section;
    onBack: () => void;
    updateSection: (updates: Partial<Section>) => void;
}

const FooterEditor: React.FC<FooterEditorProps> = ({ section, onBack, updateSection }) => {
    const [itemToRename, setItemToRename] = useState<Widget | null>(null);
    const [showAddTypeMenu, setShowAddTypeMenu] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showPageModal, setShowPageModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const { currentVersion } = useEditorStore();
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getMenuItem = (type: string): Widget | undefined => {
        return section.params.extend.widgets?.find(item => item.type === type);
    };

    const getFooterItems = (): Widget[] => {
        const items = section.params.extend.widgets || [];
        return items.filter(item => item.type === WidgetType.PATH);
    };

    const footerItems = getFooterItems();
    const footerText = getMenuItem(WidgetType.DATA);
    const shortPressLogo = getMenuItem(WidgetType.LOGO);

    const handleAddPlaylistItem = (playlists: any[]) => {
        const items = getFooterItems();
        const newItem: PathWidget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: playlists[0].title,
            content: 'playlist',
            visible: true,
            type: WidgetType.PATH,
            path: playlists[0].id
        };
        
        const widgets = [...(section.params.extend.widgets || []), newItem];
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
        setShowPlaylistModal(false);
    };

    const handleAddPageItem = (pageId: string, pageName: string) => {
        const items = getFooterItems();
        const newItem: PathWidget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: pageName,
            content: 'page',
            visible: true,
            type: WidgetType.PATH,
            path: pageId
        };
        
        const widgets = [...(section.params.extend.widgets || []), newItem];
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
        setShowPageModal(false);
    };

    const handleAddUrlItem = (url: string) => {
        const items = getFooterItems();
        const newItem: PathWidget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: url,
            content: 'url',
            visible: true,
            type: WidgetType.PATH,
            path: url
        };
        
        const widgets = [...(section.params.extend.widgets || []), newItem];
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
        setShowUrlModal(false);
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<Widget>) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const itemIndex = widgets.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            widgets[itemIndex] = { ...widgets[itemIndex], ...updates };

            updateSection({
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets,
                    },
                },
            });
        }
    };

    const handleMenuItemDelete = (itemId: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const filteredItems = widgets.filter(item => item.id !== itemId);
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets: filteredItems,
                },
            },
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const itemToDuplicate = widgets.find(item => item.id === itemId);

        if (itemToDuplicate) {
            const newItem: Widget = {
                ...itemToDuplicate,
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: `${itemToDuplicate.label} (Copy)`,
            };

            widgets.push(newItem);

            updateSection({
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets,
                    },
                },
            });
        }
    };

    const handleLabelBlur = (id: string, value: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);

        if (existingItem) {
            existingItem.data = value;
        }

        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };

    const handleToggle = (id: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);

        if (existingItem) {
            existingItem.visible = !existingItem.visible;
        } 

        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };


    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const widgets = [...(section.params.extend.widgets || [])];
            const oldIndex = widgets.findIndex(item => item.id === active.id);
            const newIndex = widgets.findIndex(item => item.id === over.id);

            const [movedItem] = widgets.splice(oldIndex, 1);
            widgets.splice(newIndex, 0, movedItem);

            updateSection({
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets,
                    },
                },
            });
        }
    };

    const handleRenameConfirm = (newName: string) => {
        if (itemToRename) {
            handleMenuItemUpdate(itemToRename.id, { label: newName });
            setItemToRename(null);
        }
    };

    return (
        <div className="p-4 bg-white h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button onClick={onBack} className="text-gray-400">
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-[20px] font-semibold text-black-purple">Footer</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 text-sm text-gray-500 flex items-center gap-2">
                <IconExclamationCircle className="text-primary flex-shrink-0" size={16} />
                <p>Footer Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Menu Items */}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={footerItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {footerItems.map(item => (
                                <WidgetPageItem
                                    key={item.id}
                                    item={item}
                                    onToggleVisibility={(id) => handleMenuItemUpdate(id, { visible: !item.visible })}
                                    onDuplicate={handleMenuItemDuplicate}
                                    onDelete={handleMenuItemDelete}
                                    onRename={(item) => setItemToRename(item)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <Menu opened={showAddTypeMenu} onChange={setShowAddTypeMenu}>
                    <Menu.Target>
                        <div className={`flex items-center justify-center gap-3 p-2 rounded-lg border border-black my-2 cursor-pointer`} onClick={() => setShowAddTypeMenu(true)}>
                            <IconPlus size={16} className="text-purple-black" />
                            <span className="text-purple-black">Add Menu</span>
                        </div>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconPlaylist size={16} />}
                            onClick={() => {
                                setShowAddTypeMenu(false);
                                setShowPlaylistModal(true);
                            }}
                        >
                            Playlist
                            <div className="text-xs text-gray-500">Link to a playlist</div>
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconFile size={16} />}
                            onClick={() => {
                                setShowAddTypeMenu(false);
                                setShowPageModal(true);
                            }}
                        >
                            Page
                            <div className="text-xs text-gray-500">Link to a page</div>
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconLink size={16} />}
                            onClick={() => {
                                setShowAddTypeMenu(false);
                                setShowUrlModal(true);
                            }}
                        >
                            URL
                            <div className="text-xs text-gray-500">Link an external resource</div>
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
 
            {/* Footer Text */}
            <LabelMenuItem
                title="Footer Text"
                widget={footerText}
                onToggle={() => handleToggle(footerText?.id ?? '')}
                onBlur={value => handleLabelBlur(footerText?.id ?? '', value)}
            />

            {/* ShortPress Logo */}
            <IconMenuItem title="ShortPress Logo" widget={shortPressLogo} onToggle={() => handleToggle(shortPressLogo?.id ?? '')} />

            {/* Selection Modals */}
            <PlaylistSelector
                key={'footer-playlist-selector'}
                open={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                onSelect={handleAddPlaylistItem}
            />

            <PageSelector
                open={showPageModal}
                onClose={() => setShowPageModal(false)}
                pages={currentVersion?.pages || []}
                onSelect={handleAddPageItem}
            />

            <UrlInputSelector
                open={showUrlModal}
                onClose={() => setShowUrlModal(false)}
                onSelect={handleAddUrlItem}
            />

            <InputModal
                opened={!!itemToRename}
                onClose={() => setItemToRename(null)}
                onSubmit={handleRenameConfirm}
                title="Rename Menu Item"
                placeholder="Enter menu item name"
                initialValue={itemToRename?.label || ''}
            />
        </div>
    );
};

export default FooterEditor;
