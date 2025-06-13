import React, { useEffect, useState } from 'react';
import { IconArrowLeft, IconUpload, IconX, IconGripVertical, IconDotsVertical } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, BaseSectionParams, WidgetType, Widget } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import { LogoMenuItem } from '../section-editor/common/menu-items';
import CreatorApi from '@/api/creator';
import { toast } from 'sonner';

interface NavMenuEditorProps {
    widget: any;
    onBack: () => void;
}

const MENU_TYPES = {
    NAV: 'nav',
    NAV_ITEM: 'nav_item'
} as const;

const NavMenuEditor: React.FC<NavMenuEditorProps> = ({ widget, onBack }) => {
    const { currentPage,currentVersion, currentSection, updateSection,updateShareSection, isSharedSectionFunc } = useEditorStore();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [localSection, setLocalSection] = useState<Section | null>(null);
    const [isSharedSection, setIsSharedSection] = useState(false);
  
    

    useEffect(() => {
        console.log('localWidget', localSection);
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

    const getNavItems = (): Widget[] => {
        return localSection?.params.extend.widgets?.filter((w: Widget) => w.id === widget.id)??[];
    };

    const updateWidgetData = (updatedItems: Widget[]) => {
        if (!currentPage || !localSection) return;

        const sectionUpdate = currentVersion?.pages.find(p => p.id === currentPage)?.sections.find(s => s.id === localSection.id);
        if (!sectionUpdate) return;
        const widgetUpdate = sectionUpdate.params.extend.widgets?.find(w => w.id === widget.id);
        if (!widgetUpdate) return;
        widgetUpdate.widgets = updatedItems;

        if (isSharedSection) {
            updateShareSection(localSection.id, sectionUpdate);
        } else {
            updateSection(currentPage, localSection.id, sectionUpdate);
        }
    };

    const handleIconUpload = async (file: File) => {
        if (!file) return;
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await CreatorApi.uploadFile(formData);
            setIsLoading(false);
            
            if (res.code === 0) {
                const imageUrl = res.data;
                const items = getNavItems();
                const navIcon = items[0] || {
                    id: createUniqueUUID(items.map(item => item.id)),
                    label: 'Nav Icon',
                    content: MENU_TYPES.NAV,
                    type: WidgetType.DEFAULT,
                    visible: true
                };
                
                navIcon.image = imageUrl;
                const updatedItems = items.length > 0 ? [navIcon, ...items.slice(1)] : [navIcon];
                updateWidgetData(updatedItems);
            } else {
                toast.error(res.info);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error('Failed to upload image');
        }
    };

    const handleAddMenuItem = () => {
        const items = getNavItems();
        const newItem: Widget = {
            id: createUniqueUUID(items.map(item => item.id)),
            label: 'New Menu Item',
            content: MENU_TYPES.NAV_ITEM,
            visible: true,
            type: WidgetType.DEFAULT
        };
        
        updateWidgetData([...items, newItem]);
    };

    const handleMenuItemUpdate = (itemId: string, updates: Partial<Widget>) => {
        const items = getNavItems();
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        
        updateWidgetData(updatedItems);
    };

    const handleMenuItemDelete = (itemId: string) => {
        const items = getNavItems();
        const updatedItems = items.filter(item => item.id !== itemId);
        
        updateWidgetData(updatedItems);
    };

    const handleMenuItemDuplicate = (itemId: string) => {
        const items = getNavItems();
        const itemToDuplicate = items.find(item => item.id === itemId);
        
        if (itemToDuplicate) {
            const newItem: Widget = {
                ...itemToDuplicate,
                id: createUniqueUUID(items.map(item => item.id)),
                label: `${itemToDuplicate.label} (Copy)`
            };
            
            updateWidgetData([...items, newItem]);
        }
    };

    const handleToggle = (itemId: string) => {
        console.log('itemId', itemId);
        const items = widget.widgets??[];

        console.log('updatedItems', items);
        const updatedItems = items.map((item: Widget) =>
            item.id === itemId ? { ...item, visible: item.visible === undefined? true : !item.visible } : item
        );
        console.log('updatedItems', updatedItems);
        updateWidgetData(updatedItems);
    };

    const navIcon = getNavItems()[0];
    const navItems = getNavItems();

    console.log('navItems', navItems);
    console.log('navIcon', navIcon);

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
                <h2 className="text-[20px] font-semibold text-black-purple">Nav Menu</h2>
            </div>

            {/* Nav Icon */}
            <LogoMenuItem widget={navIcon} onUpload={handleIconUpload} onToggle={() => {handleToggle(navIcon.id) } } title={'Nav Icon'}/>

            {/* Menu Items */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-medium text-black-purple">Menu Items</h3>
                    <button
                        onClick={handleAddMenuItem}
                        className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Add Menu
                    </button>
                </div>

                <div className="space-y-2">
                    {navItems.map((item) => (
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
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <IconDotsVertical size={16} />
                                    </button>
                                    {activeMenu === item.id && (
                                        <div className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-lg shadow-xl z-10">
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                onClick={() => handleToggle(item.id)}
                                            >
                                                {item.visible ? 'Hide in Menu' : 'Show in Menu'}
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                onClick={() => handleMenuItemDuplicate(item.id)}
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 transition-colors"
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