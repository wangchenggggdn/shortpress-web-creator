'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ActionIcon, Menu } from '@mantine/core';
import { IconPencil, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { IVideo, VideoStatus } from '@/types/video';
import { dateFormatSecond } from '@/utils/formatUtil';
import { toast } from 'sonner';

interface PlaylistVideoItemProps {
    video: IVideo;
    index: number;
    isEditing: boolean;
    onEdit: (video: IVideo) => void;
    onDelete: (id: string) => void;
    onOrderChange: (index: number, newIndex: number) => void;
    onIndexChange: (index: number, newIndex: number) => void;
}

const PlaylistVideoItem: React.FC<PlaylistVideoItemProps> = ({ video, index, isEditing, onEdit, onDelete, onOrderChange, onIndexChange }) => {
    const [currentIndex, setCurrentIndex] = useState<string | null>(null);
    const [isInputting, setIsInputting] = useState(false);
    const [tempIndex, setTempIndex] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentIndex != null && currentIndex.length > 0) {
            const newIndex = currentIndex;
            onIndexChange(index, Number.parseInt(newIndex));
            setCurrentIndex(null);
            setTempIndex(null);
        }
    }, [currentIndex]);

    const handleDragStart = (e: React.DragEvent) => {
        e.stopPropagation();
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);

        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            e.dataTransfer.setDragImage(itemRef.current, e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const container = itemRef.current?.parentElement;
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const scrollSpeed = 10;

            if (e.clientY < containerRect.top + 50) {
                container.scrollBy(0, -scrollSpeed);
            } else if (e.clientY > containerRect.bottom - 50) {
                container.scrollBy(0, scrollSpeed);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(draggedIndex) && draggedIndex !== index) {
            onOrderChange(draggedIndex, index);
        }
    };

    return (
        <div
            ref={itemRef}
            className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${isDragOver ? 'py-8 border-t-2 border-blue-500' : 'hover:bg-gray-200'} ${isDragging ? 'opacity-50' : ''}`}
            draggable={isEditing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <IconGripVertical size={20} className="text-gray-400 cursor-grab" />
                        <input
                            type="number"
                            className="w-16 text-center text-gray-500 border rounded [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                            value={tempIndex != null ? tempIndex : currentIndex != null ? currentIndex : (index + 1).toString()}
                            onFocus={e => {
                                setIsInputting(true);
                                setTempIndex(e.target.value);
                            }}
                            onBlur={e => {
                                setIsInputting(false);
                                setCurrentIndex(e.target.value);
                            }}
                            onChange={e => {
                                !isInputting && setCurrentIndex(e.target.value);
                                isInputting && setTempIndex(e.target.value);
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    setIsInputting(false);
                                    setCurrentIndex(tempIndex);
                                    e.currentTarget.blur();
                                }
                            }}
                            min="1"
                        />
                    </div>
                ) : (
                    <span className="w-16 text-center text-gray-500">{index + 1}</span>
                )}
            </div>
            <div className="flex-shrink-0 h-24 aspect-[9/16] bg-gray-100 rounded overflow-hidden">
                {video.cover && <img src={video.cover} alt={video.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 h-24 min-w-0 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-medium truncate max-w-xs md:max-w-sm lg:max-w-xl">{video.title}</h3>
                    <div className="flex items-center gap-1 text-sm">
                        {video.status === VideoStatus.PUBLISHED && (
                            <div className="flex items-center gap-1 text-green-500">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Published</span>
                            </div>
                        )}
                        {video.status === VideoStatus.UNPUBLISHED && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <span>Unpublished</span>
                            </div>
                        )}
                        {video.status === VideoStatus.DELETED && (
                            <div className="flex items-center gap-1 text-red-500">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Deleted</span>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-500">{dateFormatSecond(video.createdAt)}</p>
            </div>
            <div className="flex gap-2">
                <ActionIcon variant="subtle" color="bg-black-purple" onClick={() => onEdit(video)}>
                    <IconPencil size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => onDelete(video.vid)}>
                    <IconTrash size={20} />
                </ActionIcon>
            </div>
        </div>
    );
};

export default PlaylistVideoItem;
