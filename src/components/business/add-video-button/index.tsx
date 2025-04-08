'use client';

import React from 'react';
import { Button, Menu } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import addVideos from '@/assets/images/public/add_videos.webp';
import uploadVideos from '@/assets/images/public/upload_videos.webp';

interface AddVideoButtonProps {
    /** Callback function when choosing existing videos */
    onChooseExisting: () => void;
    /** Callback function when uploading new videos */
    onUploadNew?: () => void;
    /** Button text, defaults to "Add Videos" */
    buttonText?: string;
    /** Button variant style, defaults to "filled" */
    variant?: string;
    /** Button color, defaults to "primary" */
    color?: string;
}

/**
 * Add Video Button Component
 * Includes a dropdown menu with options to choose existing videos or upload new ones
 */
const AddVideoButton: React.FC<AddVideoButtonProps> = ({ onChooseExisting, onUploadNew, buttonText = 'Add Videos', variant = 'filled', color = 'primary' }) => {
    return (
        <Menu>
            <Menu.Target>
                <Button leftSection={<IconPlus size={16} />} variant={variant} color={color}>
                    {buttonText}
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item className="text-black-purple" onClick={onUploadNew} leftSection={<img src={uploadVideos.src} alt="upload videos" width={16} height={16} />}>
                    Upload new videos
                </Menu.Item>
                <Menu.Item className="text-black-purple" onClick={onChooseExisting} leftSection={<img src={addVideos.src} alt="add videos" width={16} height={16} />}>
                    Choose from existing videos
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default AddVideoButton;
