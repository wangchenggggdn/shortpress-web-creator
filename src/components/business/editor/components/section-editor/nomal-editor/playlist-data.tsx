import React, { useEffect, useState } from 'react';
import { DataWidget, Section, Widget, WidgetType } from '@/types/editor';
import WidgetPageItem from '../../common/WidgetPageItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Playlist } from '@/types/playlist';

interface PlaylistDataProps {
    widgets: DataWidget[];
    onClose: () => void;
    addContent: () => void;
    updateWidgetDataToSection: (updates: Playlist[]) => void;
}

const PlaylistData: React.FC<PlaylistDataProps> = ({ widgets, onClose, addContent, updateWidgetDataToSection }) => {
    const playlists: Playlist[] = widgets[0]?.data || [];
    const [items, setItems] = useState<DataWidget[]>([]);

    useEffect(() => {
        setItems(
            playlists.map(playlist => ({
                id: playlist.playlistId,
                label: playlist.title,
                image: playlist.cover,
                type: WidgetType.DATA,
                visible: true,
                data: playlist,
            }))
        );
    }, [widgets]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setItems(items => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                const newData = newItems.map(item => item.data as Playlist);
                updateWidgetDataToSection(newData);
                return newItems;
            });
        }
    };

    const handleDelete = (id: string) => {
        setItems(items => {
            const newItems = items.filter(item => item.id !== id);
            updateWidgetDataToSection(newItems.map(item => item.data as Playlist));
            return newItems;
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            {/* <div className="flex items-center p-4 border-b border-gray-200">
                <button onClick={onClose} className="text-[#6366F1] flex items-center gap-1 text-sm">
                    ← Sections
                </button>
                <h1 className="text-xl font-bold text-[#1E293B] ml-4">Carousel Data</h1>
            </div> */}

            {/* Subtitle */}
            {/* <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg text-[#64748B]">Carousel Data</h2>
            </div> */}

            {/* Content */}
            <div className="max-h-[calc(100vh-420px)] overflow-auto">
                {/* <h3 className="text-lg text-[#94A3B8] mb-4">Data</h3> */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {items.map(item => (
                                <WidgetPageItem
                                    key={item.id}
                                    item={item}
                                    onToggleVisibility={() => {}}
                                    onDuplicate={() => {}}
                                    onDelete={handleDelete}
                                    onRename={() => {}}
                                    variant="simple"
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button className="w-full px-6 py-2.5 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] text-base" onClick={addContent}>
                    Add Playlist
                </button>
            </div>
        </div>
    );
};

export default PlaylistData;
