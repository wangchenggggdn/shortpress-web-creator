'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Modal, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import CreatorApi from '@/api/creator';
import { GuideName } from '@/types/guide';
import userStore from '@/store/useUserStore';
import { toast } from 'sonner';
import { createUniqueUUID } from '@/utils/public';
import { EventName } from '@/types/event';
import profileEventBus from '@/utils/profileEventBus';

interface UploadVideoModalProps {
    opened: boolean;
    onClose: () => void;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ opened, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const { uploadFileList, openUploadProgressModal, setUploadFileList, setOpenUploadProgressModal, maxLimit,successedFiles,setSuccessedFiles } = fileUploadStore();
    const uploadFileListRef = useRef<IVideo[] | null>();
    // const currentList = useMemo(() => uploadFileListRef.current, [uploadFileListRef.current]);
    // const isCheckRef = useRef(false);
    // const { userInfo } = userStore();
    // const successedFilesRef = useRef<IVideo[] | null>(null);

    // useEffect(() => {
    //     isCheckRef.current = (successedFiles ?? []).length !== 0;
    //     if(isCheckRef.current){
    //         checkUploadStatus();
    //     }
    //     console.log('successedFiles:',successedFiles,'successedFilesRef:',successedFilesRef.current);
    //     if(successedFiles&&successedFiles.length<(successedFilesRef.current??[]).length){
    //         profileEventBus.emit(EventName.UploadVideoSuccess);
    //     }
    //     successedFilesRef.current = successedFiles;
    // }, [successedFiles]);

    useEffect(() => {   
        uploadFileListRef.current = uploadFileList;
    }, [uploadFileList]);

    // const checkUploadStatusR = async () => {
    //     const vids = successedFiles?.map(item => {
    //         if(item.vid.startsWith('video_')){
    //             return item.vid.replace('video_', '');
    //         }
    //         return item.vid;
    //     }) ?? [];
    //     console.log('begin checkUploadStatusR----------');
    //     const res = await VideoApi.batchGet(vids.join(','));
    //     console.log('res:',res.code);
    //     if (res.code === 0) {
    //         if (userInfo?.guides.find(item => item.name === GuideName.UploadVideo)?.status !== 1) {
    //             CreatorApi.completeGuides({ guides: [GuideName.UploadVideo] });
    //         }
    //         deleteSuccessedFiles(res.data.items ?? []);
    //     }
    // };

    // const deleteSuccessedFiles = (videos: IVideo[]) => {
    //     let successIndexs:number[] = [];
    //     successedFiles?.forEach((successedFile,index) => {
    //         const video = videos.find(item => item.vid === successedFile.vid);
    //         if (video&&video.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS) {
    //             successIndexs.push(index);
    //         }
    //     });

    //     if (successIndexs.length > 0) {
    //         setSuccessedFiles(prev => prev?.filter((item,index) => !successIndexs.includes(index)) ?? []);
    //     }
    // }

    // const checkUploadStatus = async () => {
    //     while (isCheckRef.current) {
    //         console.log('isCheckRef.current:',isCheckRef.current);
    //         if(!isCheckRef.current) continue;
    //         await new Promise(resolve => setTimeout(resolve, 1000));
    //         console.log('checkUploadStatusR--------------------------------');
    //         await checkUploadStatusR();
    //     }
    // };

    const initUploadFileList = (files: File[]): IVideo[] => {
        const items: IVideo[] = files.map(file => ({
            vid: `video_${createUniqueUUID(uploadFileListRef.current?.map(item => item.vid.replace('video_', '')) ?? [])}`,
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
        if ((uploadFileList ?? []).length + files.length > 200) {
            toast.warning('Maximum upload limit of 200 files at once reached. Please remove some files before uploading more.');
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
