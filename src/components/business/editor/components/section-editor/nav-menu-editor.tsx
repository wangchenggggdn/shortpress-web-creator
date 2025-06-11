import React, { useState } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, HeaderSectionParams, MenuItem, NavMenu } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface NavMenuEditorProps {
    section: Section;
    onBack: () => void;
}

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ section, onBack }) => {
    const { currentPage, updateSection } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const headerParams: HeaderSectionParams = section.params as HeaderSectionParams;

    const handleIconUpload = async (file: File) => {
        if (!currentPage) return;
        
        // TODO: Implement file upload
        console.log('Upload nav icon:', file);
        
        const navMenu: NavMenu = {
            ...headerParams.extend.navMenu,
            icon: URL.createObjectURL(file),
            items: headerParams.extend.navMenu?.items || []
        };
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                navMenu
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleAddMenuItem = () => {
        if (!currentPage) return;
        
        const newItem: MenuItem = {
            id: uuidv4(),
            label: 'New Menu Item',
            path: '/new-page',
            visible: true
        };
        
        const navMenu: NavMenu = {
            ...headerParams.extend.navMenu,
            items: [...(headerParams.extend.navMenu?.items || []), newItem]
        };
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                navMenu
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<MenuItem>) => {
        if (!currentPage || !headerParams.extend.navMenu) return;
        
        const navMenu: NavMenu = {
            ...headerParams.extend.navMenu,
            items: headerParams.extend.navMenu.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            )
        };
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                navMenu
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemDelete = (itemId: string) => {
        if (!currentPage || !headerParams.extend.navMenu) return;
        
        const navMenu: NavMenu = {
            ...headerParams.extend.navMenu,
            items: headerParams.extend.navMenu.items.filter(item => item.id !== itemId)
        };
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                navMenu
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        if (!currentPage || !headerParams.extend.navMenu) return;
        
        const itemToDuplicate = headerParams.extend.navMenu.items.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: MenuItem = {
                ...itemToDuplicate,
                id: uuidv4(),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            const navMenu: NavMenu = {
                ...headerParams.extend.navMenu,
                items: [...headerParams.extend.navMenu.items, newItem]
            };
            
            const params: HeaderSectionParams = {
                ...headerParams,
                extend: {
                    ...headerParams.extend,
                    navMenu
                }
            };
            
            updateSection(currentPage, section.id, {
                params,
                order: section.order
            });
        }
    };

    const { extend } = headerParams;

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 rounded"
                >
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-medium">Nav Menu</h2>
            </div>

            {/* Nav Icon */}
            <div className="mb-6">
                <h3 className="font-medium mb-2">Nav icon</h3>
                {extend.navMenu?.icon ? (
                    <div className="relative w-12 h-12">
                        <img
                            src={extend.navMenu.icon}
                            alt="Nav Icon"
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={() => {
                                const navMenu: NavMenu = {
                                    ...headerParams.extend.navMenu!,
                                    icon: undefined,
                                    items: headerParams.extend.navMenu!.items
                                };
                                
                                const params: HeaderSectionParams = {
                                    ...headerParams,
                                    extend: {
                                        ...headerParams.extend,
                                        navMenu
                                    }
                                };
                                updateSection(currentPage!, section.id, { 
                                    params,
                                    order: section.order
                                });
                            }}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                        >
                            <IconX size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <IconUpload size={20} className="text-gray-400" />
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
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Menu Items</h3>
                    <button
                        onClick={handleAddMenuItem}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Menu
                    </button>
                </div>

                <div className="space-y-2">
                    {extend.navMenu?.items?.map((item: MenuItem) => (
                        <div
                            key={item.id}
                            className={`bg-white border rounded-lg ${
                                activeMenu === item.id ? 'border-blue-500' : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-center p-3">
                                <IconGripVertical size={16} className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent focus:outline-none"
                                    value={item.label}
                                    onChange={(e) => handleMenuItemUpdate(item.id, { label: e.target.value })}
                                />
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <IconDotsVertical size={16} />
                                    </button>
                                    {activeMenu === item.id && (
                                        <div className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-lg shadow-xl z-10">
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                onClick={() => handleMenuItemUpdate(item.id, { visible: !item.visible })}
                                            >
                                                {item.visible ? 'Hide in Menu' : 'Show in Menu'}
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                                onClick={() => handleMenuItemDuplicate(item.id)}
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
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