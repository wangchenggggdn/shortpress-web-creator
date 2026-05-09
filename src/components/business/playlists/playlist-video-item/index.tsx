'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ActionIcon, Checkbox, Menu } from '@mantine/core';
import { IconPencil, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { IVideo, VideoSourceType, VideoStatus } from '@/types/video';
import { withResMediaCacheBust } from '@/utils/mediaUrl';
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
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelectionChange?: (id: string, selected: boolean) => void;
}

const PlaylistVideoItem: React.FC<PlaylistVideoItemProps> = ({
    video,
    index,
    isEditing,
    selectionMode = false,
    isSelected = false,
    onEdit,
    onDelete,
    onOrderChange,
    onIndexChange,
    onSelectionChange,
}) => {
    const [currentIndex, setCurrentIndex] = useState<string | null>(null);
    const [isInputting, setIsInputting] = useState(false);
    const [tempIndex, setTempIndex] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentIndex != null && currentIndex.length > 0) {
            const newIndex = currentIndex;
            onIndexChange(index, Number.parseInt(newIndex));
            setCurrentIndex(null);
            setTempIndex(null);
        }
    }, [currentIndex]);

    // Load video only on hover
    useEffect(() => {
        if (isHovering && !isVideoLoaded) {
            setIsVideoLoaded(true);
        }
    }, [isHovering, isVideoLoaded]);

    // Handle video play/pause on hover
    useEffect(() => {
        if (!videoRef.current || !isVideoLoaded) return;

        if (isHovering) {
            videoRef.current.play().catch(() => {
                // Ignore play errors
            });
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isHovering, isVideoLoaded]);

    const handleItemClick = () => {
        if (selectionMode) {
            onSelectionChange?.(video.vid, !isSelected);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelectionChange?.(video.vid, e.currentTarget.checked);
    };

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

    const rawVideoUrl = video.sources?.find(source => source.sourceType === VideoSourceType.LOCAL)?.url;
    const videoUrl = rawVideoUrl ? withResMediaCacheBust(rawVideoUrl, video.updatedAt) : undefined;
    const coverUrl = video.cover ? withResMediaCacheBust(video.cover, video.updatedAt) : undefined;

    return (
        <div
            ref={itemRef}
            className={`flex items-center gap-4 p-4 transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-primary' : ''} ${
                isDragOver ? 'py-8 border-t-2 border-blue-500' : 'hover:bg-gray-200'
            } ${isDragging ? 'opacity-50' : ''} ${selectionMode ? 'cursor-pointer' : ''}`}
            draggable={isEditing && !selectionMode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleItemClick}
        >
            <div className="flex items-center gap-2">
                {selectionMode ? (
                    <div className="w-16 flex justify-center" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={handleCheckboxChange} size="md" />
                    </div>
                ) : isEditing ? (
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
            <div
                ref={videoContainerRef}
                className="flex-shrink-0 h-24 aspect-[9/16] bg-gray-100 rounded overflow-hidden relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* 封面图片 - 始终显示 */}
                {coverUrl &&
                    (coverUrl.toLowerCase().includes('.webm') ? (
                        <video src={coverUrl} className="w-full h-full object-cover absolute inset-0" autoPlay muted loop playsInline />
                    ) : (
                        <img src={coverUrl} alt={video.title} className="w-full h-full object-cover absolute inset-0" />
                    ))}

                {/* 视频 - 仅在悬停时加载并显示 */}
                {isVideoLoaded && videoUrl && (
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                    />
                )}
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
            {!selectionMode && (
                <div className="flex gap-2">
                    {video.status !== VideoStatus.DELETED && (
                        <ActionIcon
                            variant="subtle"
                            color="bg-black-purple"
                            onClick={e => {
                                e.stopPropagation();
                                onEdit(video);
                            }}
                        >
                            <IconPencil size={20} />
                        </ActionIcon>
                    )}
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={e => {
                            e.stopPropagation();
                            onDelete(video.vid);
                        }}
                    >
                        <IconTrash size={20} />
                    </ActionIcon>
                </div>
            )}
        </div>
    );
};

export default PlaylistVideoItem;
