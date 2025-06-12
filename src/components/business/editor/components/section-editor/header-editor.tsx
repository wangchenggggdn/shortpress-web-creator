import React, { useState, useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { BaseSectionParams, Section, MenuItem, Page } from '@/types/editor';
import { LogoMenuItem, LabelMenuItem, IconMenuItem } from '@/components/business/editor/components/section-editor/common/menu-items';
import NavMenuEditor from './nav-menu-editor';

interface HeaderEditorProps {
    onBack: () => void;
}

const MENU_TYPES = {
    LOGO: 'logo',
    LABEL: 'label',
    SEARCH: 'search',
    ACCOUNT: 'account',
    NAV: 'nav'
} as const;

const HeaderEditor: React.FC<HeaderEditorProps> = ({ onBack }) => {
    const { currentVersion, currentPage, currentSection, updateSection, updateShareSection, shareSections } = useEditorStore();
    const [showNavMenu, setShowNavMenu] = useState(false);
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [labelValue, setLabelValue] = useState('');
    const [isSharedSection, setIsSharedSection] = useState(false);

    

    // Sync with store when version changes
    useEffect(() => {
        console.log(currentVersion, currentPage, currentSection, shareSections);
        if (!currentSection) return;
        
        // Check if the section is in shareSections
        const sharedSection = shareSections.find((s: Section) => s.id === currentSection);
        if (sharedSection) {
            setLocalSection(sharedSection);
            setIsSharedSection(true);
            // Update label value if exists
            const labelItem = sharedSection.params.extend.menuItems?.find((item: MenuItem) => item.content === MENU_TYPES.LABEL);
            if (labelItem) {
                setLabelValue(labelItem.label || '');
            }
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
            // Update label value if exists
            const labelItem = pageSection.params.extend.menuItems?.find((item: MenuItem) => item.content === MENU_TYPES.LABEL);
            if (labelItem) {
                setLabelValue(labelItem.label || '');
            }
        }
    }, [currentSection, currentPage, currentVersion, shareSections]);

    const getMenuItem = (type: string) => {
        return localSection?.params.extend.menuItems?.find(item => item.content === type);
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

    const handleToggle = (type: string) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
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
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems
                }
            }
        });
    };

    const handleLogoUpload = async (file: File) => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
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
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    menuItems
                }
            }
        });
    };

    const handleLabelChange = (value: string) => {
        setLabelValue(value);
    };

    const handleLabelBlur = () => {
        if (!localSection) return;
        
        const menuItems = [...(localSection.params.extend.menuItems || [])];
        const existingItem = menuItems.find(item => item.content === MENU_TYPES.LABEL);
        
        if (existingItem) {
            existingItem.label = labelValue;
        } else {
            menuItems.push({
                id: MENU_TYPES.LABEL,
                label: labelValue,
                content: MENU_TYPES.LABEL,
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

    if (showNavMenu) {
        return (
            <NavMenuEditor
                section={localSection}
                onBack={() => setShowNavMenu(false)}
            />
        );
    }

    const logoItem = getMenuItem(MENU_TYPES.LOGO);
    const labelItem = getMenuItem(MENU_TYPES.LABEL);
    const searchItem = getMenuItem(MENU_TYPES.SEARCH);
    const accountItem = getMenuItem(MENU_TYPES.ACCOUNT);

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
                <h2 className="text-[20px] font-semibold text-black-purple">Header</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 text-sm text-gray-500">
                <p>Header Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Menu Items */}
            <LogoMenuItem
                title="Logo"
                menuItem={logoItem}
                onToggle={() => handleToggle(MENU_TYPES.LOGO)}
                onUpload={handleLogoUpload}
            />

            <LabelMenuItem
                title="Label"
                menuItem={labelItem}
                onToggle={() => handleToggle(MENU_TYPES.LABEL)}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                value={labelValue}
            />

            <IconMenuItem
                title="Search Icon"
                menuItem={searchItem}
                onToggle={() => handleToggle(MENU_TYPES.SEARCH)}
            />

            <IconMenuItem
                title="Account Icon"
                menuItem={accountItem}
                onToggle={() => handleToggle(MENU_TYPES.ACCOUNT)}
            />

            {/* Nav Menu */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <button
                    onClick={() => setShowNavMenu(true)}
                    className="w-full text-left"
                >
                    <div className="text-[15px] font-medium text-black-purple">Nav Menu</div>
                    <div className="text-sm text-gray-500">Organize your site navigation</div>
                </button>
            </div>
        </div>
    );
};

export default HeaderEditor; 