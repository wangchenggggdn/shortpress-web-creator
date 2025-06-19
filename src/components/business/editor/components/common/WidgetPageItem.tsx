import React from 'react';
import { IconGripVertical, IconDotsVertical, IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react';
import { Menu } from '@mantine/core';
import { Widget } from '@/types/editor';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import clsx from 'clsx';

interface WidgetPageItemProps {
    item: Widget;
    onToggleVisibility: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (item: Widget) => void;
    variant?: 'full' | 'simple';
}

const WidgetPageItem: React.FC<WidgetPageItemProps> = ({ item, onToggleVisibility, onDuplicate, onDelete, onRename, variant = 'full' }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (variant === 'simple') {
        return (
            <div ref={setNodeRef} style={style} className={clsx('flex items-center gap-3 p-2 bg-[#EEF2FF] rounded-lg', isDragging && 'shadow-lg')}>
                <button className="cursor-grab hover:bg-gray-100 p-1 rounded text-gray-400" {...attributes} {...listeners}>
                    <IconGripVertical size={16} />
                </button>
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                <span className="flex-1 text-[#1E293B]">{item.label}</span>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <IconTrash size={16} />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={clsx(
                'flex items-center justify-between p-2 bg-white border border-gray-200 rounded mb-2',
                (item.visible === undefined ? true : item.visible) ? '' : 'opacity-60',
                isDragging && 'shadow-lg'
            )}
        >
            <div className="flex items-center gap-2 flex-1">
                <button className="cursor-grab hover:bg-gray-100 p-1 rounded" {...attributes} {...listeners}>
                    <IconGripVertical size={16} />
                </button>
                <button onClick={() => onToggleVisibility(item.id)} className="hover:bg-gray-100 p-1 rounded">
                    {(item.visible === undefined ? true : item.visible) ? <IconEye size={16} /> : <IconEyeOff size={16} className="text-gray-400" />}
                </button>
                <span className={clsx('ml-2 max-w-[100px] truncate', (item.visible === undefined ? true : item.visible) ? 'text-black-purple' : 'text-gray-400')}>{item.label}</span>
            </div>

            <Menu position="bottom-end" offset={4} withArrow>
                <Menu.Target>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <IconDotsVertical size={16} />
                    </button>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item onClick={() => onToggleVisibility(item.id)}>{(item.visible === undefined ? true : item.visible) ? 'Hide in Menu' : 'Show in Menu'}</Menu.Item>
                    <Menu.Item onClick={() => onDuplicate(item.id)}>Duplicate</Menu.Item>
                    <Menu.Item onClick={() => onRename(item)}>Rename</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="red" onClick={() => onDelete(item.id)}>
                        Delete Menu
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
};

export default WidgetPageItem;
