'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { toast } from 'sonner';

/**
 * Props interface for UploadVideoModal component
 */
interface UploadVideoModalProps {
    /** Whether the modal is open */
    opened: boolean;
    /** Callback function when modal is closed */
    onClose: () => void;
    /** Callback function when files are selected for upload */
    onUpload: (files: File[]) => void;
}

/**
 * Modal component for uploading video files
 * Supports drag and drop and file selection
 * @returns React component with video upload interface
 */
const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ opened, onClose, onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Handle drag over event
     * @param event Drag event
     */
    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    /**
     * Handle drag leave event
     * @param event Drag event
     */
    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    };

    /**
     * Handle file drop event
     * @param event Drag event
     */
    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);

        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            onUpload(files);
            onClose();
        }
    };

    /**
     * Handle file selection button click
     */
    const handleButtonClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.multiple = true;
        fileInput.onchange = async e => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                const files = Array.from(target.files);
                if (files.length > 0) {
                    onUpload(files);
                    onClose();
                }
            }
        };
        fileInput.click();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<div className="text-lg font-medium pl-2">Upload videos</div>}
            size="lg"
            centered
            styles={{
                title: {
                    fontSize: '1.25rem',
                    fontWeight: 500,
                },
                content: {
                    borderRadius: '32px',
                },
                close: {
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                },
            }}
        >
            <div className="py-12">
                {/* Upload Area */}
                <div
                    className={`flex flex-col items-center py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleButtonClick}
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-12">
                        <IconPlus size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Drag and drop video files to upload</h3>
                    <p className="text-gray-500 text-sm mb-6">Your videos will be private until you publish them</p>
                    <Button
                        variant="filled"
                        color="primary"
                        size="md"
                        onClick={e => {
                            e.stopPropagation();
                            handleButtonClick();
                        }}
                    >
                        Select Videos
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default UploadVideoModal;
