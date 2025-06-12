import React, { useState, useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { BaseSectionParams, Section, Widget, WidgetType } from '@/types/editor';
import { LogoMenuItem, LabelMenuItem, IconMenuItem } from '@/components/business/editor/components/section-editor/common/menu-items';
import NavMenuEditor from './nav-menu-editor';
import { createUniqueUUID } from '@/utils/public';

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
    const { currentVersion, currentPage, currentSection, updateSection, updateShareSection } = useEditorStore();
    const [showNavMenu, setShowNavMenu] = useState(false);
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [labelValue, setLabelValue] = useState('');
    const [isSharedSection, setIsSharedSection] = useState(false);

    useEffect(() => {
        console.log('localSection', localSection);
    }, [localSection]);

    // Sync with store when version changes
    useEffect(() => {
        if (!currentSection) return;
        // Check if the section is in shareSections
        const sharedSection = currentVersion?.shareSections.find((s: Section) => s.id === currentSection);
        if (sharedSection) {
            setLocalSection(sharedSection);
            setIsSharedSection(true);
            // Update label value if exists
            const labelItem = sharedSection.params.extend.widgets?.find((item: Widget) => item.content === MENU_TYPES.LABEL);
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
            const labelItem = pageSection.params.extend.widgets?.find((item: Widget) => item.content === MENU_TYPES.LABEL);
            if (labelItem) {
                setLabelValue(labelItem.label || '');
            }
        }
    }, [currentSection, currentPage, currentVersion]);

    const getMenuItem = (index: number) => {
        return localSection?.params.extend.widgets?.[index];
    };

    const updateSectionData = (updates: Partial<Section>) => {
        if (!localSection) return;
        
        const updatedSection = {
            ...localSection,
            ...updates
        };
        
        if (isSharedSection) {
            updateShareSection(localSection.id, updatedSection);
        } else if (currentPage) {
            updateSection(currentPage, localSection.id, updatedSection);
        }
    };

    const handleToggle = (id: string, type: string) => {
        if (!localSection) return;
        const widgets = [...(localSection.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.visible = !existingItem.visible;
        } else {
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: type,
                content: type,
                visible: true,
                type: WidgetType.DEFAULT
            });
        }

        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    widgets
                }
            }
        });
    };

    const handleLogoUpload = async (file: File) => {
        if (!localSection) return;
        
        const widgets = [...(localSection.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.content === MENU_TYPES.LOGO);
        
        if (existingItem) {
            existingItem.image = URL.createObjectURL(file);
        } else {
            widgets.push({
                id: MENU_TYPES.LOGO,
                label: 'Logo',
                content: MENU_TYPES.LOGO,
                image: URL.createObjectURL(file),
                visible: true,
                type: WidgetType.LOGO
            });
        }
        
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    widgets
                }
            }
        });
    };

    const handleLabelChange = (value: string) => {
        setLabelValue(value);
    };

    const handleLabelBlur = () => {
        if (!localSection) return;
        
        const widgets = [...(localSection.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.content === MENU_TYPES.LABEL);
        
        if (existingItem) {
            existingItem.label = labelValue;
        } else {
            widgets.push({
                id: MENU_TYPES.LABEL,
                label: labelValue,
                content: MENU_TYPES.LABEL,
                visible: true,
                type: WidgetType.DEFAULT
            });
        }
        updateSectionData({
            params: {
                extend: {
                    ...localSection.params.extend,
                    widgets
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

    const logoItem = getMenuItem(0);
    const labelItem = getMenuItem(1);
    const searchItem = getMenuItem(2);
    const accountItem = getMenuItem(3);

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
                onToggle={() => handleToggle(logoItem?.id??'',MENU_TYPES.LOGO)}
                onUpload={handleLogoUpload}
            />

            <LabelMenuItem
                title="Label"
                menuItem={labelItem}
                onToggle={() => handleToggle(labelItem?.id??'',MENU_TYPES.LABEL)}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                value={labelValue}
            />

            <IconMenuItem
                title="Search Icon"
                menuItem={searchItem}
                onToggle={() => handleToggle(searchItem?.id??'',MENU_TYPES.SEARCH)}
            />

            <IconMenuItem
                title="Account Icon"
                menuItem={accountItem}
                onToggle={() => handleToggle(accountItem?.id??'',MENU_TYPES.ACCOUNT)}
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