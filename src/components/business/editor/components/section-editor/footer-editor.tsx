import React, { useState } from 'react';
import { IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, BaseSectionParams, MenuItem } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface FooterEditorProps {
    section: Section;
    onBack: () => void;
}

const MENU_TYPES = {
    FOOTER_TEXT: 'footer_text',
    SHORTPRESS_LOGO: 'shortpress_logo',
    FOOTER_ITEM: 'footer_item'
} as const;

const FooterEditor: React.FC<FooterEditorProps> = ({ section, onBack }) => {
    const { currentPage, updateSection } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const params = section.params as BaseSectionParams;

    const getMenuItem = (type: string): MenuItem | undefined => {
        return params.extend.menuItems?.find(item => item.content === type);
    };

    const getFooterItems = (): MenuItem[] => {
        const items = params.extend.menuItems || [];
        return items.filter(item => item.content === MENU_TYPES.FOOTER_ITEM);
    };

    const handleAddMenuItem = () => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        
        const newItem: MenuItem = {
            id: uuidv4(),
            label: 'New Menu Item',
            content: MENU_TYPES.FOOTER_ITEM,
            visible: true
        };
        
        menuItems.push(newItem);
        
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
        const itemIndex = menuItems.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            menuItems[itemIndex] = { ...menuItems[itemIndex], ...updates };
            
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
        const filteredItems = menuItems.filter(item => item.id !== itemId);
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...params.extend,
                    menuItems: filteredItems
                }
            }
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const itemToDuplicate = menuItems.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: MenuItem = {
                ...itemToDuplicate,
                id: uuidv4(),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            menuItems.push(newItem);
            
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

    const handleFooterTextChange = (text: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const footerText = menuItems.find(item => item.content === MENU_TYPES.FOOTER_TEXT);
        
        if (footerText) {
            footerText.label = text;
        } else {
            menuItems.push({
                id: MENU_TYPES.FOOTER_TEXT,
                label: text,
                content: MENU_TYPES.FOOTER_TEXT,
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

    const handleToggleShortPressLogo = () => {
        if (!currentPage) return;
        
        const menuItems = [...(params.extend.menuItems || [])];
        const shortPressLogo = menuItems.find(item => item.content === MENU_TYPES.SHORTPRESS_LOGO);
        
        if (shortPressLogo) {
            shortPressLogo.visible = !shortPressLogo.visible;
        } else {
            menuItems.push({
                id: MENU_TYPES.SHORTPRESS_LOGO,
                label: 'ShortPress Logo',
                content: MENU_TYPES.SHORTPRESS_LOGO,
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

    const footerText = getMenuItem(MENU_TYPES.FOOTER_TEXT);
    const shortPressLogo = getMenuItem(MENU_TYPES.SHORTPRESS_LOGO);
    const footerItems = getFooterItems();

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 rounded"
                >
                    <IconX size={20} />
                </button>
                <h2 className="text-lg font-medium">Footer</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p>Footer Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
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
                    {footerItems.map((item) => (
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

            {/* Footer Text */}
            <div className="mb-6">
                <h3 className="font-medium mb-2">Footer Text</h3>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={footerText?.label || ''}
                    onChange={(e) => handleFooterTextChange(e.target.value)}
                    placeholder="Enter footer text"
                />
            </div>

            {/* ShortPress Logo */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium">ShortPress Logo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={shortPressLogo?.visible ?? false}
                            onChange={handleToggleShortPressLogo}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default FooterEditor; 