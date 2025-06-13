import React, { useState, useEffect } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical, IconPlaylist, IconFile, IconLink, IconSearch } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, WidgetType, Widget, DataSourceType, PathWidget, DataWidget } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import { LogoMenuItem } from '../common/menu-items';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';
import { Menu, Modal, TextInput, Select } from '@mantine/core';
import InputModal from '@/components/common/input-modal';
import WidgetPageItem from '../common/WidgetPageItem';

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
import PlaylistSelector from '../common/PlaylistSelector';
import PageSelector from '../common/PageSelector';
import UrlInputSelector from '../common/UrlInputSelector';
import { Playlist } from '@/types/playlist';

interface NavMenuEditorProps {
    widget: any;
    currentSection: Section;
    onBack: () => void;
    updateWidgetDataToSection: (updates: Partial<Widget>) => void;
}

const MENU_TYPES = {
    NAV: 'nav',
    NAV_ITEM: 'nav_item',
    PLAYLIST: 'playlist',
    PAGE: 'page',
    URL: 'url'
} as const;

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ widget, currentSection, onBack, updateWidgetDataToSection }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<Widget | null>(null);
    const [showAddTypeMenu, setShowAddTypeMenu] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showPageModal, setShowPageModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const { currentVersion } = useEditorStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getNavItems = (): Widget[] => {
        const items = (currentSection?.params.extend.widgets?.find((w: Widget) => w.id === widget.id)??[]).widgets??[];
        return items;
    };

    const updateWidgetData = (updatedItems: Widget[]) => {
        if (!currentSection) return;
        const widgetUpdate = currentSection.params.extend.widgets?.find(w => w.id === widget.id);
        if (!widgetUpdate) return;
        widgetUpdate.widgets = updatedItems;
        updateWidgetDataToSection(widgetUpdate);
    };

    const handleIconUpload = async (file: File) => {
        if (!file) return;
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await CreatorApi.uploadFile(formData);
            setIsLoading(false);
            
            if (res.code === 0) {
                const imageUrl = res.data;
                const items = getNavItems();
                const navIcon = items[0] || {
                    id: createUniqueUUID(items.map(item => item.id)),
                    label: 'Nav Icon',
                    content: MENU_TYPES.NAV,
                    type: WidgetType.DEFAULT,
                    visible: true
                };
                
                navIcon.image = imageUrl;
                const updatedItems = items.length > 0 ? [navIcon, ...items.slice(1)] : [navIcon];
                updateWidgetData(updatedItems);
            } else {
                toast.error(res.info);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Failed to upload image');
        }
    };

    const handleAddPlaylistItem = (playlists: Playlist[]) => {
        const playlistId = playlists[0].playlistId;
        const playlistName = playlists[0].title;
        const items = getNavItems();
        const newItem: DataWidget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: playlistName,
            content: MENU_TYPES.PLAYLIST,
            visible: true,
            type: WidgetType.DATA,
            data: {
                type: DataSourceType.PLAYLIST,
                id: playlistId
            }
        };
        
        updateWidgetData([...items, newItem]);
        setShowPlaylistModal(false);
    };

    const handleAddPageItem = (pageId: string, pageName: string) => {
        const items = getNavItems();
        const newItem: PathWidget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: pageName,
            content: MENU_TYPES.PAGE,
            visible: true,
            type: WidgetType.PATH,
            path: pageId
        };
        
        updateWidgetData([...items, newItem]);
        setShowPageModal(false);
    };

    const handleAddUrlItem = (url: string) => {
        // Add the URL menu item
        const newWidget: PathWidget = {
            id: createUniqueUUID(getNavItems().map(item => item.id)),
            type: WidgetType.PATH,
            path: url,
            label: url,
            visible: true
        };
        updateWidgetData([...getNavItems(), newWidget]);
        setShowUrlModal(false);
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<Widget>) => {
        const items = getNavItems();
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        
        updateWidgetData(updatedItems);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const items = getNavItems();
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            updateWidgetData(arrayMove(items, oldIndex, newIndex));
        }
    };

    const handleToggle = (id: string) => {
        const items = getNavItems();
        const updatedItems = items.map(item => {
            if (item.id === id) {
                return { ...item, visible: !item.visible };
            }
            return item;
        });
        updateWidgetData(updatedItems);
    };

    const handleMenuItemDuplicate = (id: string) => {
        const items = getNavItems();
        const itemToDuplicate = items.find(item => item.id === id);
        if (!itemToDuplicate) return;

        const newItem = {
            ...itemToDuplicate,
            id: createUniqueUUID(items.map(item => item.id)),
            label: `${itemToDuplicate.label} (Copy)`
        };

        updateWidgetData([...items, newItem]);
    };

    const handleMenuItemDelete = (id: string) => {
        const items = getNavItems();
        const updatedItems = items.filter(item => item.id !== id);
        updateWidgetData(updatedItems);
    };

    const handleRename = (newName: string) => {
        if (!currentMenuItem) return;
        handleMenuItemUpdate(currentMenuItem.id, { label: newName });
        setIsRenameModalOpen(false);
        setCurrentMenuItem(null);
    };

    if(getNavItems().length === 0){
        return (
            <div className="p-4 bg-white h-full overflow-y-auto">
                <div className="flex items-center mb-4">
                    <button onClick={onBack} className="mr-2">
                        <IconArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-medium">Navigation Menu</h2>
                </div>
                <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)]">
                    <IconUpload size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">No menu items yet</p>
                    <p className="text-gray-400 text-sm">Add a logo or text to get started</p>
                </div>
            </div>
        );
    }

    const navIcon = getNavItems()[0];
    const navItems = getNavItems().slice(1);

    return (
        <div className="p-4 bg-white h-full overflow-y-auto">
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={onBack}
                    className="text-gray-400"
                >
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-[20px] font-semibold text-black-purple">Nav Menu</h2>
            </div>

            {/* Nav Icon */}
            <LogoMenuItem isLoading={isLoading} widget={navIcon} onUpload={handleIconUpload} onToggle={() => {handleToggle(navIcon.id)}} title={'Nav Icon'}/>

            {/* Menu Items */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-medium text-black-purple">Menu Items</h3>
                    <Menu opened={showAddTypeMenu} onChange={setShowAddTypeMenu}>
                        <Menu.Target>
                            <button
                                className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                Add Menu
                            </button>
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
                                <div className="text-xs text-gray-500">Add existing playlists to section</div>
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconFile size={16} />}
                                onClick={() => {
                                    setShowAddTypeMenu(false);
                                    setShowPageModal(true);
                                }}
                            >
                                Page
                                <div className="text-xs text-gray-500">Link directly to another page</div>
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
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={navItems}
                        strategy={verticalListSortingStrategy}
                    >
                        {navItems.map((item) => (
                            <WidgetPageItem
                                key={item.id}
                                item={item}
                                onToggleVisibility={handleToggle}
                                onDuplicate={handleMenuItemDuplicate}
                                onDelete={handleMenuItemDelete}
                                onRename={(item) => {
                                    setCurrentMenuItem(item);
                                    setIsRenameModalOpen(true);
                                }}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            <InputModal
                opened={isRenameModalOpen}
                onClose={() => {
                    setIsRenameModalOpen(false);
                    setCurrentMenuItem(null);
                }}
                onSubmit={handleRename}
                title="Rename Menu Item"
                placeholder="Enter menu item name"
                submitText="Rename"
                initialValue={currentMenuItem?.label}
            />

            {/* Playlist Selection Modal */}
            <PlaylistSelector
                open={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                onSelect={handleAddPlaylistItem}
            />

            {/* Page Selection Modal */}
            <PageSelector
                open={showPageModal}
                onClose={() => setShowPageModal(false)}
                pages={currentVersion?.pages || []}
                onSelect={handleAddPageItem}
            />

            {/* URL Input Modal */}
            <UrlInputSelector
                open={showUrlModal}
                onClose={() => setShowUrlModal(false)}
                onSelect={handleAddUrlItem}
            />
        </div>
    );
};

export default NavMenuEditor; 