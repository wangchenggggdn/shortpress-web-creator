import React, { useState } from 'react';
import { IconUpload, IconX } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { BaseSectionParams, Section, MenuItem } from '@/types/editor';
import NavMenuEditor from './nav-menu-editor';

interface HeaderEditorProps {
    section: Section;
    onBack: () => void;
}

const MENU_TYPES = {
    LOGO: 'logo',
    LABEL: 'label',
    SEARCH: 'search',
    ACCOUNT: 'account',
    NAV: 'nav'
} as const;

const HeaderEditor: React.FC<HeaderEditorProps> = ({ section, onBack }) => {
    const { currentVersion, currentPage, updateSection } = useEditorStore();
    const [showNavMenu, setShowNavMenu] = useState(false);
    const headerParams = section.params as BaseSectionParams;

    const getMenuItem = (type: string): MenuItem | undefined => {
        return headerParams.extend.menuItems?.find(item => item.content === type);
    };

    const handleToggle = (type: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(headerParams.extend.menuItems || [])];
        const existingItem = menuItems.find(item => item.content === type);
        
        if (existingItem) {
            existingItem.visible = !existingItem.visible;
        } else {
            menuItems.push({
                id: type,
                label: type,
                content: type,
                visible: true
            });
        }
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...headerParams.extend,
                    menuItems
                }
            }
        });
    };

    const handleLogoUpload = async (file: File) => {
        if (!currentPage) return;
        
        // TODO: Implement file upload
        console.log('Upload logo:', file);
        
        const menuItems = [...(headerParams.extend.menuItems || [])];
        const existingItem = menuItems.find(item => item.content === MENU_TYPES.LOGO);
        
        if (existingItem) {
            existingItem.image = URL.createObjectURL(file);
        } else {
            menuItems.push({
                id: MENU_TYPES.LOGO,
                label: 'Logo',
                content: MENU_TYPES.LOGO,
                image: URL.createObjectURL(file),
                visible: true
            });
        }
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...headerParams.extend,
                    menuItems
                }
            }
        });
    };

    const handleLabelChange = (value: string) => {
        if (!currentPage) return;
        
        const menuItems = [...(headerParams.extend.menuItems || [])];
        const existingItem = menuItems.find(item => item.content === MENU_TYPES.LABEL);
        
        if (existingItem) {
            existingItem.label = value;
        } else {
            menuItems.push({
                id: MENU_TYPES.LABEL,
                label: value,
                content: MENU_TYPES.LABEL,
                visible: true
            });
        }
        
        updateSection(currentPage, section.id, {
            params: {
                extend: {
                    ...headerParams.extend,
                    menuItems
                }
            }
        });
    };

    if (showNavMenu) {
        return (
            <NavMenuEditor
                section={section}
                onBack={() => setShowNavMenu(false)}
            />
        );
    }

    const logoItem = getMenuItem(MENU_TYPES.LOGO);
    const labelItem = getMenuItem(MENU_TYPES.LABEL);
    const searchItem = getMenuItem(MENU_TYPES.SEARCH);
    const accountItem = getMenuItem(MENU_TYPES.ACCOUNT);

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
                <h2 className="text-lg font-medium">Header</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p>Header Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Logo Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Logo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={logoItem?.visible ?? false}
                            onChange={() => handleToggle(MENU_TYPES.LOGO)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {logoItem?.visible && (
                    <div className="mt-4">
                        {logoItem.image ? (
                            <div className="relative w-24 h-24">
                                <img
                                    src={logoItem.image}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    onClick={() => {
                                        const menuItems = [...(headerParams.extend.menuItems || [])];
                                        const item = menuItems.find(item => item.content === MENU_TYPES.LOGO);
                                        if (item) {
                                            item.image = undefined;
                                            updateSection(currentPage!, section.id, { 
                                                params: {
                                                    extend: {
                                                        ...headerParams.extend,
                                                        menuItems
                                                    }
                                                }
                                            });
                                        }
                                    }}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                                >
                                    <IconX size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <IconUpload size={24} className="text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">Upload</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleLogoUpload(file);
                                    }}
                                />
                            </label>
                        )}
                    </div>
                )}
            </div>

            {/* Label Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Label</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={labelItem?.visible ?? false}
                            onChange={() => handleToggle(MENU_TYPES.LABEL)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {labelItem?.visible && (
                    <input
                        type="text"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={labelItem.label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        placeholder="Enter label text"
                    />
                )}
            </div>

            {/* Search Icon */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Search Icon</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={searchItem?.visible ?? false}
                            onChange={() => handleToggle(MENU_TYPES.SEARCH)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Account Icon */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium">Account Icon</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={accountItem?.visible ?? false}
                            onChange={() => handleToggle(MENU_TYPES.ACCOUNT)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Nav Menu */}
            <div className="mb-6">
                <button
                    onClick={() => setShowNavMenu(true)}
                    className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                    <div className="font-medium">Nav Menu</div>
                    <div className="text-sm text-gray-500">Organize your site navigation</div>
                </button>
            </div>
        </div>
    );
};

export default HeaderEditor; 