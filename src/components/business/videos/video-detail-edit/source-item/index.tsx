import { IVideo, IVideoSource, VideoSourceType } from '@/types/video';
import { ActionIcon, TextInput } from '@mantine/core';
import { IconCheck, IconGripVertical, IconPencil, IconRepeat, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';

interface SourceItemProps {
    source: IVideoSource;
    onVideoChange: React.Dispatch<React.SetStateAction<IVideo | null>>;
    onDeleteVideo: () => void;
    onReplace: () => void;
    playlistId?: string;
}

const SourceItem: React.FC<SourceItemProps> = ({ source, onVideoChange, onDeleteVideo, onReplace, playlistId }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const isLocalVideo = useRef<boolean>(source.sourceType === VideoSourceType.LOCAL);
    const ref = useRef<HTMLDivElement>(null);
    const [tempUrl, setTempUrl] = useState(source.url);

    const handleDragStart = (e: React.DragEvent) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        // Store the priority of the dragged item
        e.dataTransfer.setData('text/plain', source.priority.toString());
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // Get the priority of the dragged item
        const draggedPriority = parseInt(e.dataTransfer.getData('text/plain'));
        const targetPriority = source.priority;

        // Don't do anything if dropping on itself
        if (draggedPriority === targetPriority) {
            return;
        }

        // Update the order of sources
        onVideoChange(prevVideo => {
            if (!prevVideo || !prevVideo.sources) return prevVideo;

            const sources = [...prevVideo.sources];

            // Find the dragged and target items
            const draggedIndex = sources.findIndex(s => s.priority === draggedPriority);
            const targetIndex = sources.findIndex(s => s.priority === targetPriority);

            if (draggedIndex === -1 || targetIndex === -1) return prevVideo;

            // Swap the items
            const [draggedItem] = sources.splice(draggedIndex, 1);
            sources.splice(targetIndex, 0, draggedItem);

            // Update priorities based on new order
            const updatedSources = sources.map((item, index) => ({
                ...item,
                priority: index,
            }));

            return { ...prevVideo, sources: updatedSources };
        });
    };

    useEffect(() => {
        if (source.url) {
            setIsEditing(false);
        }
    }, [source.url]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempUrl(e.target.value);
    };

    const handleSaveUrl = () => {
        onVideoChange(prevVideo => {
            if (!prevVideo) return null;
            const newSources = prevVideo.sources?.map(item => {
                if (item.priority === source.priority) {
                    return { ...item, url: tempUrl };
                }
                return item;
            });
            return { ...prevVideo, sources: newSources };
        });
        setIsEditing(false);
    };

    const handleDeleteSource = () => {
        onVideoChange(prevVideo => {
            if (!prevVideo) return null;
            const newSources = prevVideo.sources?.filter(item => item.priority !== source.priority);
            return { ...prevVideo, sources: newSources };
        });
    };

    return (
        <div
            ref={ref}
            className={`cursor-pointer transition-all ${isDragOver ? 'border-t-2 border-blue-500' : ''} ${isDragging ? 'opacity-50' : ''}`}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                className={`flex items-center ${playlistId && isLocalVideo.current ? 'justify-start ' : 'justify-between'} gap-2 border border-gray-100 px-2 rounded-lg hover:bg-gray-200 h-[30px]`}
            >
                <IconGripVertical size={18} className="text-gray-400 cursor-grab shrink-0" />
                {isEditing ? (
                    <TextInput
                        value={tempUrl}
                        size="xs"
                        className="flex-1"
                        onChange={handleUrlChange}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleSaveUrl();
                            }
                        }}
                    />
                ) : (
                    <p className="text-sm text-gray-700 truncate max-w-[200px] flex-1">{source.url}</p>
                )}
                {isLocalVideo.current ? (
                    !playlistId && (
                        <div className="flex gap-1 shrink-0">
                            <ActionIcon variant="subtle" color="bg-black-purple" onClick={onReplace}>
                                <IconRepeat size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={onDeleteVideo}>
                                <IconTrash size={18} />
                            </ActionIcon>
                        </div>
                    )
                ) : isEditing ? (
                    <div className="flex gap-1 shrink-0">
                        <ActionIcon variant="subtle" color="bg-black-purple" onClick={handleSaveUrl}>
                            <IconCheck size={18} />
                        </ActionIcon>
                    </div>
                ) : (
                    <div className="flex gap-1 shrink-0">
                        <ActionIcon variant="subtle" color="bg-black-purple" onClick={() => setIsEditing(true)}>
                            <IconPencil size={18} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={handleDeleteSource}>
                            <IconTrash size={18} />
                        </ActionIcon>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SourceItem;
