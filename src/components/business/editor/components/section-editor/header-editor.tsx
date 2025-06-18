import React, { useState } from 'react';
import { IconArrowLeft, IconExclamationCircle } from '@tabler/icons-react';
import { Section, Widget, WidgetType } from '@/types/editor';
import { LogoMenuItem, LabelMenuItem, IconMenuItem } from '@/components/business/editor/components/common/menu-items';
import NavMenuEditor from '../widget-editor/nav-menu-editor';
import { createUniqueUUID } from '@/utils/public';
import CreatorApi from '@/api/creator';
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
} as const;

const HeaderEditor: React.FC<HeaderEditorProps> = ({ section, onBack, updateSection }) => {
    const [showWidget, setShowWidget] = useState<Widget | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getMenuItem = (index: number) => {
        return section.params.extend.widgets?.[index];
    };

    const handleToggle = (id: string, type: string) => {
        const widgets = [...(section.params.extend.widgets || [])];
        const existingItem = widgets.find(item => item.id === id);

        if (existingItem) {
            existingItem.visible = !existingItem.visible;
        } else {
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
        updateSection({
            params: {
                extend: {
                    ...section.params.extend,
                    widgets,
                },
            },
        });
    };

    if (showWidget) {
        return <SectionWidgetEditor widget={showWidget} onBack={() => setShowWidget(null)} />;
    }

    const logoItem = getMenuItem(0);
    const labelItem = getMenuItem(1);
    const searchItem = getMenuItem(2);
    const accountItem = getMenuItem(3);
    const vipItem0 = getMenuItem(4);
    const navItem = getMenuItem(5);

    return (
        <div className="p-4 bg-white h-full overflow-y-auto">
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

            <IconMenuItem title="Account Icon" widget={accountItem} onToggle={() => handleToggle(accountItem?.id ?? '', MENU_TYPES.ACCOUNT)} />

            <IconMenuItem title="VIP Icon" widget={vipItem0} onToggle={() => handleToggle(vipItem0?.id ?? '', MENU_TYPES.VIP)} />

            {/* Nav Menu */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
                <button onClick={() => setShowWidget(navItem)} className="w-full text-left">
                    <div className="text-[15px] font-medium text-black-purple">Nav Menu</div>
                    <div className="text-sm text-gray-500">Organize your site navigation</div>
                </button>
            </div>
        </div>
    );
};

export default HeaderEditor;
