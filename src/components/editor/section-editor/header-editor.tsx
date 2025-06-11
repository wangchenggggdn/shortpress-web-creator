import React, { useState } from 'react';
import { IconUpload, IconX } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, HeaderSectionParams } from '@/types/editor';
import NavMenuEditor from './nav-menu-editor';

interface HeaderEditorProps {
    section: Section;
    onBack: () => void;
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ section, onBack }) => {
    const { currentVersion, currentPage, updateSection } = useEditorStore();
    const [showNavMenu, setShowNavMenu] = useState(false);
    const headerParams: HeaderSectionParams = section.params as HeaderSectionParams;

    const handleToggle = (key: keyof HeaderSectionParams['extend']) => {
        if (!currentPage) return;
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                [key]: !headerParams.extend[key]
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleLabelChange = (value: string) => {
        if (!currentPage) return;
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                label: value
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
        });
    };

    const handleLogoUpload = async (file: File) => {
        if (!currentPage) return;
        
        // TODO: Implement file upload
        console.log('Upload logo:', file);
        
        const params: HeaderSectionParams = {
            ...headerParams,
            extend: {
                ...headerParams.extend,
                logo: URL.createObjectURL(file)
            }
        };
        
        updateSection(currentPage, section.id, {
            params,
            order: section.order
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

    const { extend } = headerParams;

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
                            checked={extend.showLogo}
                            onChange={() => handleToggle('showLogo')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {extend.showLogo && (
                    <div className="mt-4">
                        {extend.logo ? (
                            <div className="relative w-24 h-24">
                                <img
                                    src={extend.logo}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    onClick={() => {
                                        const params: HeaderSectionParams = {
                                            ...headerParams,
                                            extend: {
                                                ...headerParams.extend,
                                                logo: undefined
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
                            checked={extend.showLabel}
                            onChange={() => handleToggle('showLabel')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                {extend.showLabel && (
                    <input
                        type="text"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={extend.label || ''}
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
                            checked={extend.showSearchIcon}
                            onChange={() => handleToggle('showSearchIcon')}
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
                            checked={extend.showAccountIcon}
                            onChange={() => handleToggle('showAccountIcon')}
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