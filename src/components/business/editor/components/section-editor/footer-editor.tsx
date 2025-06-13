import React, { useState } from 'react';
import { IconArrowLeft, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import { Section, Widget, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';

interface FooterEditorProps {
    section: Section;
    onBack: () => void;
    updateSection: (updates: Partial<Section>) => void;
}

const MENU_TYPES = {
    FOOTER_TEXT: 'footer_text',
    SHORTPRESS_LOGO: 'shortpress_logo',
    FOOTER_ITEM: 'footer_item'
} as const;

const FooterEditor: React.FC<FooterEditorProps> = ({ section, onBack, updateSection }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const getMenuItem = (type: string): Widget | undefined => {
        return section.params.extend.widgets?.find(item => item.content === type);
    };

    const getFooterItems = (): Widget[] => {
        const items = section.params.extend.widgets || [];
        return items.filter(item => item.content === MENU_TYPES.FOOTER_ITEM);
    };

    const handleAddMenuItem = () => {
        const widgets = [...(section.params.extend.widgets || [])];
        
        const newItem: Widget = {
            id: createUniqueUUID(widgets.map(item => item.id)),
            label: 'New Menu Item',
            content: MENU_TYPES.FOOTER_ITEM,
            visible: true,
            type: WidgetType.DEFAULT
        };
        
        widgets.push(newItem);
        
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets
                }
            }
        });
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
                        widgets
                    }
                }
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
                    widgets: filteredItems
                }
            }
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const itemToDuplicate = widgets.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: Widget = {
                ...itemToDuplicate,
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            widgets.push(newItem);
            
            updateSection({
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets
                    }
                }
            });
        }
    };

    const handleFooterTextChange = (text: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const footerText = widgets.find(item => item.content === MENU_TYPES.FOOTER_TEXT);
        
        if (footerText) {
            footerText.label = text;
        } else {
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: text,
                content: MENU_TYPES.FOOTER_TEXT,
                visible: true,
                type: WidgetType.DEFAULT
            });
        }
        
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets
                }
            }
        });
    };

    const handleToggleShortPressLogo = () => {
        const widgets = [...(section.params.extend.widgets || [])];
        const shortPressLogo = widgets.find(item => item.content === MENU_TYPES.SHORTPRESS_LOGO);
        
        if (shortPressLogo) {
            shortPressLogo.visible = !shortPressLogo.visible;
        } else {
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: 'ShortPress Logo',
                content: MENU_TYPES.SHORTPRESS_LOGO,
                visible: true,
                type: WidgetType.LOGO
            });
        }
        
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets
                }
            }
        });
    };

    const footerText = getMenuItem(MENU_TYPES.FOOTER_TEXT);
    const shortPressLogo = getMenuItem(MENU_TYPES.SHORTPRESS_LOGO);
    const footerItems = getFooterItems();

    return (
        <div className="p-4 bg-white h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={onBack}
                    className="text-gray-400"
                >
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-[20px] font-semibold text-black-purple">Footer</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 text-sm text-gray-500">
                <p>Footer Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Menu Items */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-medium text-black-purple">Menu Items</h3>
                    <button
                        onClick={handleAddMenuItem}
                        className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                        Add Menu
                    </button>
                </div>

                <div className="space-y-2">
                    {footerItems.map((item) => (
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
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-[15px] font-medium text-black-purple mb-2">Footer Text</h3>
                <textarea
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    rows={3}
                    value={footerText?.label || ''}
                    onChange={(e) => handleFooterTextChange(e.target.value)}
                    placeholder="Enter footer text"
                />
            </div>

            {/* ShortPress Logo */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                    <span className="text-[15px] font-medium text-black-purple">ShortPress Logo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={shortPressLogo?.visible ?? false}
                            onChange={handleToggleShortPressLogo}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default FooterEditor; 