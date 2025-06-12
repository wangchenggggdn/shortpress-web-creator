'use client';

import useEditorStore from '@/store/useEditorStore';
import { Section, Widget, WidgetType } from '@/types/editor';
import { IconArrowLeft } from '@tabler/icons-react';
import React from 'react';
import NavMenuEditor from './nav-menu-editor';


interface SectionEditorProps {
    section: Section;
    widget: any;
    onBack: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section,widget, onBack }) => {
    console.log('widget', widget);
    switch (widget.type) {
        case WidgetType.NAV:
            return <NavMenuEditor widget={widget} onBack={onBack} />;
        // case WidgetType.DATA:
        //     return <LabelEditor onBack={onBack} />;
        // case WidgetType.PATH:
        //     return <SearchEditor onBack={onBack} />;
        // case WidgetType.DEFAULT:
        //     return <AccountEditor onBack={onBack} />;
        default:
            return (
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-200 rounded"
                            title="Back to sections"
                        >
                            <IconArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-medium">Edit {section.type}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="text-gray-500">
                            Section editor for {section.type} is under development
                        </div>
                    </div>
                </div>
            );
    }
};

export default SectionEditor; 