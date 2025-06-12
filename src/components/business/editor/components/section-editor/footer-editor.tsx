import React, { useState, useEffect } from 'react';
import { IconArrowLeft, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, BaseSectionParams, MenuItem } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface FooterEditorProps {
    onBack: () => void;
}

const MENU_TYPES = {
    FOOTER_TEXT: 'footer_text',
    SHORTPRESS_LOGO: 'shortpress_logo',
    FOOTER_ITEM: 'footer_item'
} as const;

const FooterEditor: React.FC<FooterEditorProps> = ({ onBack }) => {
    const { currentVersion, currentPage, currentSection, updateSection, updateShareSection, shareSections } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [isSharedSection, setIsSharedSection] = useState(false);

    // Sync with store when version changes
    useEffect(() => {
        if (!currentSection) return;
        
        // Check if the section is in shareSections
        const sharedSection = shareSections.find((s: Section) => s.id === currentSection);
        if (sharedSection) {
            setLocalSection(sharedSection);
            setIsSharedSection(true);
            return;
        }

        // If not in shareSections, check in currentPage
        if (!currentVersion || !currentPage) return;
        
        const currentPageData = currentVersion.pages.find(p => p.id === currentPage);
        if (!currentPageData) return;
        
        const pageSection = currentPageData.sections.find((s: Section) => s.id === currentSection);
        if (pageSection) {
            setLocalSection(pageSection);
            setIsSharedSection(false);
        }
    }, [currentSection, currentPage, currentVersion, shareSections]);

    const getMenuItem = (type: string): MenuItem | undefined => {
        return localSection?.params.extend.menuItems?.find(item => item.content === type);
    };

    const getFooterItems = (): MenuItem[] => {
        const items = localSection?.params.extend.menuItems || [];
        return items.filter(item => item.content === MENU_TYPES.FOOTER_ITEM);
    };

    const updateSectionData = (updates: Partial<Section>) => {
        if (!localSection) return;
        
        const updatedSection = {
            ...localSection,
            ...updates
        };
        
        setLocalSection(updatedSection);
        
        if (isSharedSection) {
            updateShareSection(localSection.id, updates);
        } else if (currentPage) {
            updateSection(currentPage, localSection.id, updates);
        }
    };

    const handleAddMenuItem = () => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
        
        const newItem: MenuItem = {
            id: uuidv4(),
            label: 'New Menu Item',
            content: MENU_TYPES.FOOTER_ITEM,
            visible: true
        };
        
        menuItems.push(newItem);
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems
                }
            }
        });
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<MenuItem>) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
        const itemIndex = menuItems.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            menuItems[itemIndex] = { ...menuItems[itemIndex], ...updates };
            
            updateSectionData({
                params: {
                    extend: {
                        ...localSection.params.extend,
                        menuItems
                    }
                }
            });
        }
    };

    const handleMenuItemDelete = (itemId: string) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
        const filteredItems = menuItems.filter(item => item.id !== itemId);
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems: filteredItems
                }
            }
        });
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
        const itemToDuplicate = menuItems.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: MenuItem = {
                ...itemToDuplicate,
                id: uuidv4(),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            menuItems.push(newItem);
            
            updateSectionData({
                params: {
                    extend: {
                        ...localSection.params.extend,
                        menuItems
                    }
                }
            });
        }
    };

    const handleFooterTextChange = (text: string) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
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
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems
                }
            }
        });
    };

    const handleToggleShortPressLogo = () => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
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
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems
                }
            }
        });
    };

    if (!localSection) {
        return null; // or loading state
    }

    const footerText = getMenuItem(MENU_TYPES.FOOTER_TEXT);
    const shortPressLogo = getMenuItem(MENU_TYPES.SHORTPRESS_LOGO);
    const footerItems = getFooterItems();

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