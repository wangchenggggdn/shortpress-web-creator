import React, { useState, useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { BaseSectionParams, Section, Widget, WidgetType } from '@/types/editor';
import { LogoMenuItem, LabelMenuItem, IconMenuItem } from '@/components/business/editor/components/section-editor/common/menu-items';
import NavMenuEditor from '../widget-editor/nav-menu-editor';
import { createUniqueUUID } from '@/utils/public';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';

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
    const { currentVersion, currentPage, currentSection, updateSection, updateShareSection, isSharedSectionFunc } = useEditorStore();
    const [showWidget, setShowWidget] = useState<Widget | null>(null);
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [isSharedSection, setIsSharedSection] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('localSection', localSection);
    }, [localSection]);

    // Sync with store when version changes
    useEffect(() => {
        if (!currentSection) return;
        setIsSharedSection(isSharedSectionFunc());
        // Check if the section is in shareSections
        const sharedSection = currentVersion?.shareSections.find((s: Section) => s.id === currentSection.id);
        if (sharedSection) {
            setLocalSection(sharedSection);
            return;
        }

        // If not in shareSections, check in currentPage
        if (!currentVersion || !currentPage) return;
        const currentPageData = currentVersion.pages.find(p => p.id === currentPage);
        if (!currentPageData) return;
        
        const pageSection = currentPageData.sections.find((s: Section) => s.id === currentSection.id);
        if (pageSection) {
            setLocalSection(pageSection);
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

    const handleLogoUpload = async (id: string,file: File) => {
        let imageUrl = '';
        if(file){
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            const res = await CreatorApi.uploadFile(formData);
            setIsLoading(false);
            if(res.code === 0){
                imageUrl = res.data ?? '';
            }else{
                toast.error(res.info);
                return;
            }
        }
        if (!localSection) return;
        
        const widgets = [...(localSection.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.image = imageUrl;
        } else {
            widgets.push({
                id: MENU_TYPES.LOGO,
                label: 'Logo',
                content: MENU_TYPES.LOGO,
                image: imageUrl,
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

    const handleLabelBlur = (id: string,value: string) => {
        if (!localSection) return;
        
        const widgets = [...(localSection.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.data = value;
        } else {
            widgets.push({
                id: MENU_TYPES.LABEL,
                label: value,
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

    if (showWidget) {
        return (
            <NavMenuEditor
                widget={showWidget}
                onBack={() => setShowWidget(null)}
            />
        );
    }

    const logoItem = getMenuItem(0);
    const labelItem = getMenuItem(1);
    const searchItem = getMenuItem(2);
    const accountItem = getMenuItem(3);
    const navItem = getMenuItem(4);

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
                <h2 className="text-[20px] font-semibold text-black-purple">Header</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 text-sm text-gray-500">
                <p>Header Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Menu Items */}
            <LogoMenuItem
                isLoading={isLoading}
                title="Logo"
                widget={logoItem}
                onToggle={() => handleToggle(logoItem?.id??'',MENU_TYPES.LOGO)}
                onUpload={(file) => handleLogoUpload(logoItem?.id??'',file)}
            />

            <LabelMenuItem
                title="Label"
                widget={labelItem}
                onToggle={() => handleToggle(labelItem?.id??'',MENU_TYPES.LABEL)}
                onBlur={(value) => handleLabelBlur(labelItem?.id??'',value)}
            />

            <IconMenuItem
                title="Search Icon"
                widget={searchItem}
                onToggle={() => handleToggle(searchItem?.id??'',MENU_TYPES.SEARCH)}
            />

            <IconMenuItem
                title="Account Icon"
                widget={accountItem}
                onToggle={() => handleToggle(accountItem?.id??'',MENU_TYPES.ACCOUNT)}
            />

            {/* Nav Menu */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <button
                    onClick={() => setShowWidget(navItem)}
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