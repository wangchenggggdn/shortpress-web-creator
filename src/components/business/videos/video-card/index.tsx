'use client';

import { IVideo, VideoSourceType, VideoStatus } from '@/types/video';
import { withResMediaCacheBust } from '@/utils/mediaUrl';
import { dateFormatSecond } from '@/utils/formatUtil';
import { ActionIcon, Checkbox, Menu } from '@mantine/core';
import { IconDots, IconEye, IconEyeOff, IconPencil, IconTrash } from '@tabler/icons-react';
import React from 'react';

/**
 * Props interface for VideoCard component
 */
interface VideoCardProps extends IVideo {
    /** Custom text for delete action */
    deleteString?: string;
    /** Callback function when edit action is triggered */
    onEdit?: (id: string) => void;
    /** Callback function when delete action is triggered */
    onDelete?: (id: string) => void;
    /** Callback function when copy link action is triggered */
    onCopyLink?: (id: string) => void;
    /** Callback function when card is clicked */
    onClick?: (id: string) => void;
    /** Whether the card is in selection mode */
    selectionMode?: boolean;
    /** Whether the card is selected */
    isSelected?: boolean;
    /** Callback function when selection changes */
    onSelectionChange?: (id: string, selected: boolean) => void;
}

/**
 * Video card component
 * Displays video information with cover image, duration, and action menu
 * @returns React component with video card interface
 */
const VideoCard: React.FC<VideoCardProps> = ({
    vid,
    title,
    cover,
    status,
    duration,
    createdAt,
    updatedAt,
    views,
    sources,
    deleteString = 'Delete',
    selectionMode = false,
    isSelected = false,
    onEdit,
    onDelete,
    onCopyLink,
    onClick,
    onSelectionChange,
}) => {
    /**
     * Handle menu item click to prevent event bubbling
     * @param e Mouse event
     * @param callback Optional callback function
     */
    const handleMenuItemClick = (e: React.MouseEvent, callback?: (id: string) => void) => {
        e.stopPropagation();
        callback?.(vid);
    };

    const handleCardClick = () => {
        if (selectionMode) {
            onSelectionChange?.(vid, !isSelected);
        } else {
            onClick?.(vid);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelectionChange?.(vid, e.currentTarget.checked);
    };

    return (
        <div className="bg-layout rounded-lg overflow-hidden shadow-md group w-full cursor-pointer transition-all" onClick={handleCardClick}>
            {/* Cover Image Container - Fixed 9:16 aspect ratio */}
            <div className="relative aspect-[9/16] bg-gray-100 w-full">
                {cover ? (
                    <div className="absolute inset-0">
                        {cover.toLowerCase().includes('.webm') ? (
                            <video src={withResMediaCacheBust(cover, updatedAt) ?? cover} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                            <img src={withResMediaCacheBust(cover, updatedAt) ?? cover} alt={title} className="w-full h-full object-cover" loading="lazy" />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full pb-20 flex items-center justify-center text-gray-400">No Cover</div>
                )}

                {/* Selection Checkbox */}
                {selectionMode && (
                    <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
                        <Checkbox
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            size="md"
                            styles={{
                                input: {
                                    cursor: 'pointer',
                                },
                            }}
                        />
                    </div>
                )}

                {/* Status Label */}
                {!selectionMode && (
                    <div className="absolute top-2 left-2">
                        {status === VideoStatus.PUBLISHED ? <IconEye size={20} color="rgba(97,85,246,1)" /> : <IconEyeOff size={20} color="rgba(0,0,0,0.5)" />}
                    </div>
                )}

                {/* Action Menu */}
                {!selectionMode && (
                    <div className="absolute top-2 right-2">
                        <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                                <ActionIcon
                                    variant="filled"
                                    className="bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <IconDots size={16} color="white" />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconPencil size={14} />} onClick={e => handleMenuItemClick(e, onEdit)}>
                                    Edit
                                </Menu.Item>
                                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={e => handleMenuItemClick(e, onDelete)}>
                                    {deleteString}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                )}

                {/* Video Info Section */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-end justify-center">
                    {/* Duration */}
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded mr-2 mb-2">
                        {dateFormatSecond(
                            sources?.find(source => source.sourceType === VideoSourceType.LOCAL)?.duration ?? 0,
                            (sources?.find(source => source.sourceType === VideoSourceType.LOCAL)?.duration ?? 0) > 1 * 60 * 60 ? 'HH:mm:ss' : 'mm:ss'
                        )}
                    </div>

                    {/* Video Details */}
                    <div className="w-full p-2 bg-layout">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1" title={title}>
                            {title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{dateFormatSecond(createdAt)}</span>
                            {views !== undefined && <span>{views.toLocaleString()} views</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;
