'use client';

import React, { useEffect } from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import useEditorStore from '@/store/useEditorStore';
import { Section, SectionType, Widget, WidgetType } from '@/types/editor';
import NavMenuEditor from './nav-menu-editor';

interface SectionEditorProps {
    widget: Widget;
    onBack: () => void;
}       

const SectionWidgetEditor: React.FC<SectionEditorProps> = ({ widget, onBack }) => {
    const { currentVersion, currentPage, currentSection, setCurrentSection, updateSection, updateShareSection, isSharedSectionFunc } = useEditorStore();

    useEffect(() => {
        const isShared = isSharedSectionFunc();
        let section = null;
        if(isShared){
            section = currentVersion?.shareSections.find(s => s.id === currentSection?.id);
        }else{
            section = currentVersion?.pages.find(p => p.id === currentPage)?.sections.find(s => s.id === currentSection?.id);
        }
        if(section){
            setCurrentSection(section);
        }
    }, [currentVersion]);

    const updateWidgetDataToSection = (updates: Partial<Widget>) => {
        if (!currentSection) return;

        const widgetUpdate = currentSection.params.extend.widgets?.find(w => w.id === widget.id);
        if (!widgetUpdate) return;

        Object.assign(widgetUpdate, updates);

        if (isSharedSectionFunc()) {
            updateShareSection(currentSection.id, currentSection);
        } else if (currentPage) {
            updateSection(currentPage, currentSection.id, currentSection);
        }
    };

    console.log('-----------------widget', widget);
    
    switch (widget.type) {
        case WidgetType.NAV:
            return currentSection&& <NavMenuEditor 
                widget={widget} 
                currentSection={currentSection}
                onBack={onBack} 
                updateWidgetDataToSection={updateWidgetDataToSection}
            />;
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

export default SectionWidgetEditor; 