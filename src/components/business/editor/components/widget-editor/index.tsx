'use client';

import React from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, Widget, WidgetType } from '@/types/editor';
import NavMenuEditor from './nav-menu-editor';


interface SectionEditorProps {
    widget: Widget;
    onBack: () => void;
}       

const SectionEditor: React.FC<SectionEditorProps> = ({ widget, onBack }) => {
    const { currentVersion, currentPage, currentSection } = useEditorStore();


    switch (widget.type) {
        case WidgetType.NAV:
            return <NavMenuEditor widget={widget} onBack={onBack} />;
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
                        <h2 className="text-lg font-medium">Edit {widget.type}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="text-gray-500">
                            Section editor for {widget.type} is under development
                        </div>
                    </div>
                </div>
            );
    }
};

export default SectionEditor; 