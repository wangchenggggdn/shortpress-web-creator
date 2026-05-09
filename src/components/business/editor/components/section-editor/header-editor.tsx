import CreatorApi from '@/api/creator';
import { IconMenuItem, LabelMenuItem, LogoMenuItem } from '@/components/business/editor/components/common/menu-items';
import useEditorStore from '@/store/useEditorStore';
import { Section, WidgetType } from '@/types/editor';
import { createUniqueUUID } from '@/utils/public';
import { IconArrowLeft, IconExclamationCircle } from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import SectionWidgetEditor from '../widget-editor';

interface HeaderEditorProps {
    section: Section;
    onBack: () => void;
    updateSection: (updates: Partial<Section>) => void;
}

const MENU_TYPES = {
    LOGO: 'logo',
    LABEL: 'label',
    SEARCH: 'search',
    ACCOUNT: 'account',
    VIP: 'vip',
    NAV: 'nav',
    SCROLL: 'scroll',
} as const;

const HeaderEditor: React.FC<HeaderEditorProps> = ({ section, onBack, updateSection }) => {
    const { setCurrentWidget, currentWidget, editWebsite, currentVersion } = useEditorStore();
    const [isLoading, setIsLoading] = useState(false);

    // ✅ 兼容旧数据: 自动初始化 Nav Menu
    useEffect(() => {
        const widgets = section.params.extend.widgets || [];
        const hasNavMenu = widgets.some(widget => widget.type === WidgetType.NAV);

        // 如果没有 Nav Menu,自动创建一个默认的
        if (!hasNavMenu) {
            const newWidgets = [...widgets];
            newWidgets.push({
                id: createUniqueUUID(newWidgets.map(item => item.id)),
                label: 'Nav Menu',
                content: '',
                visible: false, // 默认隐藏,用户可以手动开启
                type: WidgetType.NAV,
                widgets: [
                    {
                        id: createUniqueUUID(newWidgets.map(item => item.id)),
                        label: 'Nav Icon',
                        type: WidgetType.LOGO,
                        path: '',
                        visible: true,
                    },
                ],
            });

            updateSection({
                params: {
                    extend: {
                        ...section.params.extend,
                        widgets: newWidgets,
                    },
                },
            });
        }
    }, []); // 只在组件挂载时执行一次

    const getMenuItem = (index: number) => {
        const menuItem = section.params.extend.widgets?.[index];
        return menuItem;
    };

    const handleToggle = (id: string, type: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);

        const isScrollItem = type === MENU_TYPES.SCROLL;

        if (existingItem) {
            // 切换现有项的状态
            if (isScrollItem) {
                existingItem.scroll = !existingItem.scroll;
            } else {
                existingItem.visible = !existingItem.visible;
            }
        } else {
            // 创建新项 (除了 Nav Menu,因为它已在 useEffect 中自动创建)
            widgets.push({
                id: createUniqueUUID(widgets.map(item => item.id)),
                label: type,
                content: type,
                visible: true,
                type: WidgetType.DEFAULT,
            });
        }

        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };

    const handleLogoUpload = async (id: string, file: File) => {
        let imageUrl = '';
        if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            const res = await CreatorApi.uploadFile(formData);
            setIsLoading(false);
            if (res.code === 0) {
                imageUrl = res.data ?? '';
            } else {
                toast.error(res.info);
                return;
            }
        }

        const widgets = [...(section.params.extend.widgets || [])];
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
                type: WidgetType.LOGO,
            });
        }

        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };

    const handleLabelBlur = (id: string, value: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);

        console.error('existingItem', existingItem);
        if (existingItem) {
            existingItem.data = value;
        } else {
            widgets.push({
                id: MENU_TYPES.LABEL,
                label: value,
                content: MENU_TYPES.LABEL,
                visible: true,
                type: WidgetType.DEFAULT,
            });
        }

        console.error('widgets---update:', widgets);
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };

    if (currentWidget) {
        return <SectionWidgetEditor widget={currentWidget} onBack={() => setCurrentWidget(null)} />;
    }

    // 获取各个菜单项
    const logoItem = getMenuItem(0);
    const labelItem = getMenuItem(1);
    if ((labelItem?.data ?? '').length === 0) {
        labelItem.data = editWebsite?.name ?? '';
    }
    const searchItem = getMenuItem(2);
    // const accountItem = getMenuItem(3);
    const vipItem0 = getMenuItem(3);
    const scroll = getMenuItem(4);
    const navItem = getMenuItem(5);

    return (
        <div className="p-4 bg-white max-h-[calc(100vh-64px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button onClick={onBack} className="text-gray-400">
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-[20px] font-semibold text-black-purple">Header</h2>
            </div>

            {/* Info Message */}
            <div className="mb-6 text-sm text-gray-500 flex items-center gap-2">
                <IconExclamationCircle className="text-primary flex-shrink-0" size={16} />
                <p>Header Section is used on all pages. Any changes made here will affect all of your pages unless otherwise specified</p>
            </div>

            {/* Menu Items */}
            <LogoMenuItem
                isLoading={isLoading}
                title="Logo"
                widget={logoItem}
                onToggle={() => handleToggle(logoItem?.id ?? '', MENU_TYPES.LOGO)}
                onUpload={file => handleLogoUpload(logoItem?.id ?? '', file)}
            />

            <LabelMenuItem
                title="Label"
                widget={labelItem}
                onToggle={() => handleToggle(labelItem?.id ?? '', MENU_TYPES.LABEL)}
                onBlur={value => handleLabelBlur(labelItem?.id ?? '', value)}
            />

            <IconMenuItem title="Search Icon" widget={searchItem} onToggle={() => handleToggle(searchItem?.id ?? '', MENU_TYPES.SEARCH)} />

            {/* <IconMenuItem title="Account Icon" widget={accountItem} onToggle={() => handleToggle(accountItem?.id ?? '', MENU_TYPES.ACCOUNT)} /> */}

            {/* Nav Menu - 带切换开关和编辑按钮 */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                    <span className="text-[15px] font-medium text-black-purple">Nav Menu</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={navItem?.visible ?? false} onChange={() => handleToggle(navItem?.id ?? '', MENU_TYPES.NAV)} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                {navItem?.visible && (
                    <button onClick={() => setCurrentWidget(navItem)} className="w-full mt-3 text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="text-sm text-gray-600">Click to edit navigation menu</div>
                    </button>
                )}
            </div>

            <IconMenuItem title="VIP Icon" widget={vipItem0} onToggle={() => handleToggle(vipItem0?.id ?? '', MENU_TYPES.VIP)} />

            <IconMenuItem title="Scroll Switching" widget={scroll} onToggle={() => handleToggle(scroll?.id ?? '', MENU_TYPES.SCROLL)} />
        </div>
    );
};

export default HeaderEditor;
