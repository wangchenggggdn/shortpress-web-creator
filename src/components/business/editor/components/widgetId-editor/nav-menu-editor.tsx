import React, { useEffect, useState } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { BaseSectionParams, WidgetType, Widget, NavMenu, Section } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';
import LogoMenuItem from '../section-editor/common/menu-items/logo-menu-item';

interface NavMenuEditorProps {
    widget: NavMenu;
    onBack: () => void;
}

const MENU_TYPES = {
    NAV: 'nav',
    NAV_ITEM: 'nav_item'
} as const;

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ onBack, widget }) => {
    const { currentPage, updateSection, currentSection, currentVersion } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('widget', widget);
    }, [currentVersion]);

    const getNavItems = (): Widget[] => {
        return widget.widgets.slice(1);
    };

    const updateWidget = (updatedWidget: NavMenu) => {
        if (!currentPage || !currentSection) return;
        
        const section = currentVersion?.pages.find(p => p.id === currentPage.id)?.sections.find(s => s.id === currentSection.id);
        if (!section) return;

        const widgets = [...(section.params.extend.widgets || [])];
        const widgetIndex = widgets.findIndex(w => w.id === widget.id);
        
        if (widgetIndex !== -1) {
            widgets[widgetIndex] = updatedWidget;
            updateSection(currentPage.id, currentSection.id, {
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets
                    }
                }
            });
        }
    };

    const handleIconUpload = async (file: File) => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const res = await CreatorApi.uploadFile(formData);
        setIsLoading(false);

        if (res.code === 0) {
            const updatedWidget = {
                ...widget,
                image: res.data
            };
            updateWidget(updatedWidget);
        } else {
            toast.error(res.info);
        }
    };

    const handleAddMenuItem = () => {
        const newItem: Widget = {
            id: createUniqueUUID(widget.widgets.map(item => item.id)),
            label: 'New Menu Item',
            content: MENU_TYPES.NAV_ITEM,
            visible: true,
            type: WidgetType.PATH
        };
        
        const updatedWidget = {
            ...widget,
            widgets: [...widget.widgets, newItem]
        };
        
        updateWidget(updatedWidget);
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<Widget>) => {
        const items = getNavItems();
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        
        const updatedWidget = {
            ...widget,
            widgets: updatedItems
        };
        
        updateWidget(updatedWidget);
    };

    const handleMenuItemDelete = (itemId: string) => {
        const items = getNavItems();
        const updatedItems = items.filter(item => item.id !== itemId);
        
        const updatedWidget = {
            ...widget,
            widgets: updatedItems
        };
        
        updateWidget(updatedWidget);
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        const items = getNavItems();
        const itemToDuplicate = items.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: Widget = {
                ...itemToDuplicate,
                id: createUniqueUUID([...items.map(item => item.id)]),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            const updatedWidget = {
                ...widget,
                widgets: [...items, newItem]
            };
            
            updateWidget(updatedWidget);
        }
    };

    const navItems = getNavItems();
    const navIcon = widget.widgets[0];

    return (
        <div className="p-4 bg-white overflow-y-auto h-full">
            {/* Header */}
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
            <LogoMenuItem widget={navIcon} onUpload={handleIconUpload} onToggle={() => {}} isLoading={isLoading} title="Nav icon" icon={<IconUpload size={20} className="text-gray-400 mb-1" />} />

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

                <div className="space-y-2">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-white border rounded-lg ${
                                activeMenu === item.id ? 'border-primary' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center p-3">
                                <IconGripVertical size={16} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent focus:outline-none focus:border-primary"
                                    value={item.label}
                                    onChange={(e) => handleMenuItemUpdate(item.id, { label: e.target.value })}
                                    placeholder="Enter menu item text"
                                />
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <IconDotsVertical size={16} />
                                    </button>
                                    {activeMenu === item.id && (
                                        <div className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-lg shadow-xl z-10">
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                onClick={() => handleMenuItemUpdate(item.id, { visible: !item.visible })}
                                            >
                                                {item.visible ? 'Hide in Menu' : 'Show in Menu'}
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                onClick={() => handleMenuItemDuplicate(item.id)}
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 transition-colors"
                                                onClick={() => handleMenuItemDelete(item.id)}
                                            >
                                                Delete Menu
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavMenuEditor; 