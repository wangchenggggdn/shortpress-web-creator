import React, { useState } from 'react';
import { IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, FooterSectionParams, MenuItem } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface FooterEditorProps {
    section: Section;
    onBack: () => void;
}

const FooterEditor: React.FC<FooterEditorProps> = ({ section, onBack }) => {
    const { currentPage, updateSection } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const footerParams: FooterSectionParams = section.params as FooterSectionParams;

    const handleAddMenuItem = () => {
        if (!currentPage) return;
        
        const menuItems = footerParams.extend.menuItems || [];
        
        const newItem: MenuItem = {
            id: uuidv4(),
            label: 'New Menu Item',
            path: '/new-page',
            visible: true
        };
        
        const params = {
            ...footerParams,
            extend: {
                ...footerParams.extend,
                menuItems: [...menuItems, newItem]
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<MenuItem>) => {
        if (!currentPage || !footerParams.extend.menuItems) return;
        
        const params: FooterSectionParams = {
            ...footerParams,
            extend: {
                ...footerParams.extend,
                menuItems: footerParams.extend.menuItems.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                )
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemDelete = (itemId: string) => {
        if (!currentPage || !footerParams.extend.menuItems) return;
        
        const params: FooterSectionParams = {
            ...footerParams,
            extend: {
                ...footerParams.extend,
                menuItems: footerParams.extend.menuItems.filter(item => item.id !== itemId)
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        if (!currentPage || !footerParams.extend.menuItems) return;
        
        const itemToDuplicate = footerParams.extend.menuItems.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: MenuItem = {
                ...itemToDuplicate,
                id: uuidv4(),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            const params: FooterSectionParams = {
                ...footerParams,
                extend: {
                    ...footerParams.extend,
                    menuItems: [...footerParams.extend.menuItems, newItem]
                }
            };
            
            updateSection(currentPage, section.id, {
                params,
                order: section.order
            });
        }
    };

    const handleFooterTextChange = (text: string) => {
        if (!currentPage) return;
        
        const params: FooterSectionParams = {
            ...footerParams,
            extend: {
                ...footerParams.extend,
                footerText: text
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleToggleShortPressLogo = () => {
        if (!currentPage) return;
        
        const params: FooterSectionParams = {
            ...footerParams,
            extend: {
                ...footerParams.extend,
                showShortPressLogo: !footerParams.extend.showShortPressLogo
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const { extend } = footerParams;

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
                    {extend.menuItems?.map((item) => (
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
                    value={extend.footerText || ''}
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
                            checked={extend.showShortPressLogo}
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