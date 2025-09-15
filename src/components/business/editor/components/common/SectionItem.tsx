import React from 'react';
import { IconGripVertical, IconDotsVertical, IconEye, IconEyeOff } from '@tabler/icons-react';
import { Menu } from '@mantine/core';
import { Section } from '@/types/editor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

interface SectionItemProps {
    section: Section;
    isSelected?: boolean;
    onToggleVisibility: (e: React.MouseEvent, section: Section) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (section: Section) => void;
    onClick: (section: Section) => void;
}

const SectionItem: React.FC<SectionItemProps> = ({ 
    section, 
    isSelected,
    onToggleVisibility, 
    onDuplicate, 
    onDelete, 
    onRename,
    onClick 
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                'flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer mb-2',
                isSelected ? 'bg-[#EEF2FF] text-[#6366F1] border-[#6366F1]' : 'hover:bg-gray-50',
                isDragging && 'opacity-50'
            )}
            onClick={() => onClick(section)}
        >
            <button 
                className="cursor-grab hover:bg-gray-100 p-1 rounded text-gray-500"
                {...attributes}
                {...listeners}
            >
                <IconGripVertical size={16} />
            </button>
            
            <button 
                onClick={(e) => onToggleVisibility(e, section)} 
                className="mr-2 text-gray-500 hover:text-gray-700"
            >
                {section.isHidden ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
            
            <span className="flex-1 truncate">{section.title}</span>

            <Menu position="bottom-end" offset={4} withArrow>
                <Menu.Target>
                    <button 
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IconDotsVertical size={16} />
                    </button>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(e, section);
                    }}>
                        {section.isHidden ? 'Show Section' : 'Hide Section'}
                    </Menu.Item>
                    <Menu.Item onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section.id);
                    }}>
                        Duplicate
                    </Menu.Item>
                    <Menu.Item onClick={(e) => {
                        e.stopPropagation();
                        onRename(section);
                    }}>
                        Rename
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                        color="red" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(section.id);
                        }}
                    >
                        Delete Section
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
};

export default SectionItem; 