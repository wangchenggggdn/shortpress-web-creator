import React, { useState, useEffect } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, BaseSectionParams, WidgetType, Widget } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import { LogoMenuItem } from '../common/menu-items';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';
import { Menu } from '@mantine/core';
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

interface NavMenuEditorProps {
    widget: any;
    currentSection: Section;
    onBack: () => void;
    updateWidgetDataToSection: (updates: Partial<Widget>) => void;
}

const MENU_TYPES = {
    NAV: 'nav',
    NAV_ITEM: 'nav_item'
} as const;

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ widget, currentSection, onBack, updateWidgetDataToSection }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState<Widget | null>(null);

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

    const handleAddMenuItem = () => {
        const items = getNavItems();
        const newItem: Widget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: 'New Menu Item',
            content: MENU_TYPES.NAV_ITEM,
            visible: true,
            type: WidgetType.DEFAULT
        };
        
        updateWidgetData([...items, newItem]);
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
                    <button
                        onClick={handleAddMenuItem}
                        className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Add Menu
                    </button>
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
        </div>
    );
};

export default NavMenuEditor; 