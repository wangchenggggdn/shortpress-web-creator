import React, { useState } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, BaseSectionParams, MenuItem } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

interface NavMenuEditorProps {
    section: Section;
    onBack: () => void;
}

const MENU_TYPES = {
    NAV: 'nav',
    NAV_ITEM: 'nav_item'
} as const;

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ section, onBack }) => {
    const { currentPage, updateSection } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const params = section.params as BaseSectionParams;

    const getNavMenu = (): MenuItem | undefined => {
        return params.extend.menuItems?.find(item => item.content === MENU_TYPES.NAV);
    };

    const getNavItems = (): MenuItem[] => {
        const navMenu = getNavMenu();
        if (!navMenu?.content) return [];
        try {
            return JSON.parse(navMenu.content);
        } catch {
            return [];
        }
    };

    const handleIconUpload = async (file: File) => {
        if (!currentPage) return;
        
        // TODO: Implement file upload
        console.log('Upload nav icon:', file);
        
        const menuItems = [...(params.extend.menuItems || [])];
        const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
        
        if (navMenu) {
            navMenu.image = URL.createObjectURL(file);
        } else {
            menuItems.push({
                id: createUniqueUUID(menuItems.map(item => item.id)),
                label: 'Navigation Menu',
                content: JSON.stringify([]),
                image: URL.createObjectURL(file),
                visible: true
            });
        }
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...params.extend,
                    menuItems
                }
            }
        });
    };

    const handleAddMenuItem = () => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
        
        const newItem: MenuItem = {
            id: createUniqueUUID(menuItems.map(item => item.id)),
            label: 'New Menu Item',
            content: MENU_TYPES.NAV_ITEM,
            visible: true
        };
        
        if (navMenu) {
            const items = getNavItems();
            navMenu.content = JSON.stringify([...items, newItem]);
        } else {
            menuItems.push({
                id: createUniqueUUID([...menuItems.map(item => item.id), newItem.id]),
                label: 'Navigation Menu',
                content: JSON.stringify([newItem]),
                visible: true
            });
        }
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...params.extend,
                    menuItems
                }
            }
        });
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<MenuItem>) => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
        
        if (navMenu) {
            const items = getNavItems();
            const updatedItems = items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            );
            navMenu.content = JSON.stringify(updatedItems);
            
            updateSection(currentPage, section.id, {
                params: {
                    extend: {
                        ...params.extend,
                        menuItems
                    }
                }
            });
        }
    };

    const handleMenuItemDelete = (itemId: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
        
        if (navMenu) {
            const items = getNavItems();
            const updatedItems = items.filter(item => item.id !== itemId);
            navMenu.content = JSON.stringify(updatedItems);
            
            updateSection(currentPage, section.id, {
                params: {
                    extend: {
                        ...params.extend,
                        menuItems
                    }
                }
            });
        }
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
        
        if (navMenu) {
            const items = getNavItems();
            const itemToDuplicate = items.find(item => item.id === itemId);
            
            if (itemToDuplicate) {
                const newItem: MenuItem = {
                    ...itemToDuplicate,
                    id: createUniqueUUID([...items.map(item => item.id)]),
                    label: `${itemToDuplicate.label} (Copy)`
                };
                
                navMenu.content = JSON.stringify([...items, newItem]);
                
                updateSection(currentPage, section.id, {
                    params: {
                        extend: {
                            ...params.extend,
                            menuItems
                        }
                    }
                });
            }
        }
    };

    const navMenu = getNavMenu();
    const navItems = getNavItems();

    return (
        <div className="p-4 bg-white">
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
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-[15px] font-medium text-black-purple mb-3">Nav icon</h3>
                {navMenu?.image ? (
                    <div className="relative w-12 h-12">
                        <img
                            src={navMenu.image}
                            alt="Nav Icon"
                            className="w-full h-full object-contain rounded-lg"
                        />
                        <button
                            onClick={() => {
                                const menuItems = [...(params.extend.menuItems || [])];
                                const navMenu = menuItems.find(item => item.content === MENU_TYPES.NAV);
                                if (navMenu) {
                                    navMenu.image = undefined;
                                    updateSection(currentPage!, section.id, { 
                                        params: {
                                            extend: {
                                                ...params.extend,
                                                menuItems
                                            }
                                        }
                                    });
                                }
                            }}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <IconX size={14} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <IconUpload size={20} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleIconUpload(file);
                            }}
                        />
                    </label>
                )}
            </div>

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