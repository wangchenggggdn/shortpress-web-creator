'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import CreatorApi from '@/api/creator';
import { GuideName } from '@/types/guide';
import userStore from '@/store/useUserStore';
import { toast } from 'sonner';

interface UploadVideoModalProps {
    opened: boolean;
    onClose: () => void;
    onUploadSuccess?: () => void;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ opened, onClose, onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { uploadFileList, openUploadProgressModal, setUploadFileList, setOpenUploadProgressModal, maxLimit } = fileUploadStore();
    const uploadFileListRef = useRef<IVideo[] | null>();
    const isCheckingRef = useRef(false);
    const { userInfo } = userStore();

    useEffect(() => {
        uploadFileListRef.current = uploadFileList;
    }, [uploadFileList]);

    useEffect(() => {
        openUploadProgressModal && checkUploadStatus();
    }, [openUploadProgressModal]);

    const checkUploadStatusR = async (vids: string[]) => {
        if (vids.length === 0) return;
        const res = await VideoApi.batchGet(vids.join(','));
        if (res.code === 0) {
            if (userInfo?.guides.find(item => item.name === GuideName.UploadVideo)?.status !== 1) {
                CreatorApi.completeGuides({ guides: [GuideName.UploadVideo] });
            }

            const newItems = (uploadFileListRef.current ?? []).map(item => {
                const newItem = (res.data.items ?? []).find(oldItem => oldItem.vid === item.vid);
                if (newItem) {
                    return { ...item, uploadStatus: newItem?.uploadStatus ?? VideoUploadStatus.NOT_UPLOADED };
                } else {
                    return item;
                }
            });
            setUploadFileList(newItems);
            if (
                !(newItems ?? []).some(
                    item =>
                        item.uploadStatus === VideoUploadStatus.UPLOADING || item.uploadStatus === VideoUploadStatus.NOT_UPLOADED || item.uploadStatus === VideoUploadStatus.NULL
                )
            ) {
                onUploadSuccess?.();
                isCheckingRef.current = false;
            }
        }
    };

    const checkUploadStatus = async () => {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!isCheckingRef.current) continue;
            const vids = uploadFileListRef.current?.map(item => item.vid) ?? [];
            const isHaveVids = vids.some(item => item !== '');
            isHaveVids && (await checkUploadStatusR(vids));
        }
    };

    const initUploadFileList = (files: File[]): IVideo[] => {
        const items: IVideo[] = files.map(file => ({
            vid: '',
            title: file.name,
            uploadStatus: VideoUploadStatus.NULL,
            status: 0,
            creatorId: '',
            createdAt: 0,
            updatedAt: 0,
            file: file,
        }));
        return items;
    };

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) {
            return;
        }
        if (!isCheckingRef.current) {
            isCheckingRef.current = true;
        }
        let uploadFileListN: IVideo[] = (uploadFileList ?? []).concat(initUploadFileList(files));
        setOpenUploadProgressModal(true);
        setUploadFileList(uploadFileListN);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        if (maxLimitCheck(files)) return;
        handleUpload(files);
        onClose();
    };

    const handleButtonClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.multiple = true;
        fileInput.onchange = async e => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                const files = Array.from(target.files);
                if (maxLimitCheck(files)) return;
                if (files.length > 0) {
                    handleUpload(files);
                    onClose();
                }
            }
        };
        fileInput.click();
    };

    const maxLimitCheck = (files: File[]) => {
        if (files.length === 0) {
            return true;
        }
        if ((uploadFileList ?? []).length + files.length > 20) {
            toast.warning('Maximum upload limit of 20 files at once reached. Please remove some files before uploading more.');
            return true;
        }

        if (maxLimit && maxLimit < files.length) {
            toast.warning(`Maximum upload limit of ${maxLimit} files for this playlist reached. Please remove some files before uploading more.`);
            return true;
        }
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
