import React from 'react';
import { Section } from '@/types/editor';
import { IconArrowLeft } from '@tabler/icons-react';
import { Switch, TextInput, Select, ScrollArea } from '@mantine/core';
import useEditorStore from '@/store/useEditorStore';
import useUserStore from '@/store/useUserStore';
import { WebTemplate } from '@/types/website';
import { DEFAULT_FOOTER_NAVIGATION } from '@/constants/initial-version';

interface FooterNavigationEditorProps {
    section: Section;
    updateSection: (updates: Partial<Section>) => void;
    onBack: () => void;
}

const FooterNavigationEditor: React.FC<FooterNavigationEditorProps> = ({ section, updateSection, onBack }) => {
    const widgets = section.params?.extend?.widgets || [];
    const { currentVersion } = useEditorStore();
    const userInfo = useUserStore(state => state.userInfo);
    const templateName = userInfo?.website?.templateName;

    const pages =
        currentVersion?.pages.map(p => ({
            value: p.path,
            label: p.name,
        })) || [];

    const handleWidgetUpdate = (index: number, updates: any) => {
        const newWidgets = [...widgets];
        newWidgets[index] = { ...newWidgets[index], ...updates };
        updateSection({
            params: {
                ...section.params,
                extend: {
                    ...section.params.extend,
                    widgets: newWidgets,
                },
            },
        });
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded" title="Back">
                    <IconArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-medium">Footer Navigation</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="space-y-4 pr-3">
                    {widgets.map((widget: any, index: number) => {
                        const defaults = DEFAULT_FOOTER_NAVIGATION[templateName as WebTemplate] || [];
                        const defaultItem = defaults[index];
                        const isSoraCreate = templateName === WebTemplate.SORA_APP && defaultItem?.label === 'Create';
                        const forYouVisible = defaultItem?.label === 'For you' && defaultItem?.visible === true;

                        return (
                            <div key={widget.id || index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-gray-700">{widget.label}</span>
                                    <Switch
                                        label="Visible"
                                        labelPosition="left"
                                        checked={widget.visible}
                                        onChange={e => handleWidgetUpdate(index, { visible: e.currentTarget.checked })}
                                        color="teal"
                                        disabled={!forYouVisible}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <TextInput label="Label" value={widget.label || ''} onChange={e => handleWidgetUpdate(index, { label: e.target.value })} disabled={true} />
                                    {isSoraCreate ? (
                                        <Select
                                            label="Link to Page"
                                            placeholder="Select a page"
                                            data={pages}
                                            value={widget.path}
                                            onChange={val => {
                                                const page = currentVersion?.pages.find(p => p.path === val);
                                                if (page && val) {
                                                    handleWidgetUpdate(index, { path: val });
                                                }
                                            }}
                                        />
                                    ) : (
                                        <TextInput label="Path" value={widget.path || ''} onChange={e => handleWidgetUpdate(index, { path: e.target.value })} disabled={true} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

export default FooterNavigationEditor;
