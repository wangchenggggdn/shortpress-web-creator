'use client';

import React, { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconLoader, IconX } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { IUploadVideo, VideoUploadStatus } from '@/types/video';
import ConfirmDialog from '@/components/common/confirm-dialog';
import UploadProgressItem from './components';
import VideoApi from '@/api/video';
import { retryRequest } from '@/api';
import profileEventBus from '@/utils/profileEventBus';
import { EventName } from '@/types/event';
const MAX_UPLOAD_COUNT = 3;

/**
 * Upload progress modal component
 * Displays upload status and progress for multiple files
 * @returns React component with upload progress interface
 */
const UploadProgressModal: React.FC = () => {
    const { openUploadProgressModal, uploadFileList, setUploadFileList, setOpenUploadProgressModal } = fileUploadStore();
    const [isExpand, setIsExpand] = useState(true);
    const [showClose, setShowClose] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        // Listen for page refresh event
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const hasUnfinishedUploads = uploadFileList?.some(
                item =>
                    item.uploadStatus === VideoUploadStatus.NOT_UPLOADED ||
                    item.uploadStatus === VideoUploadStatus.UPLOADING ||
                    item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED
            );

            if (hasUnfinishedUploads) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploadFileList]);

    useEffect(() => {
        if(uploadFileList){
            const waitingIndex = uploadFileList?.findIndex(item => (item.uploadStatus === VideoUploadStatus.NOT_UPLOADED||item.uploadStatus === VideoUploadStatus.NULL))??0;
            const uploadingCount = uploadFileList?.filter(item => item.uploadStatus === VideoUploadStatus.UPLOADING).length ?? 0;
            const uploadingItem = uploadFileList[waitingIndex];
            if(uploadingCount<MAX_UPLOAD_COUNT&&uploadingItem){
                handleUpload(uploadingItem);
            }
        }
    }, [uploadFileList]);

    useEffect(() => {
        const allSuccess = uploadFileList?.map(item => item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS).every(item => item);
        setShowClose(allSuccess ?? false);
    }, [openUploadProgressModal, uploadFileList]);

    /**
     * Handle modal close action
     * Resets upload file list and closes modal
     */
    const onClose = () => {
        setUploadFileList([]);
        setOpenUploadProgressModal(false);
    };

    const handleConfirmRefresh = () => {
        setShowConfirmDialog(false);
        window.location.reload();
    };

    const handleUpload = async (itemToUpload: IUploadVideo, isRefresh: boolean = false) => { 
        const itemId = itemToUpload.vid;
        console.log('-----------------itemToUpload:',itemToUpload.title);
        if (itemToUpload.file && (itemToUpload.uploadStatus === VideoUploadStatus.NULL || isRefresh)) {
            setUploadFileList((currentList: IUploadVideo[] | null) => 
                (currentList ?? []).map(video => 
                    video.vid === itemId
                        ? { ...video, uploadStatus: VideoUploadStatus.NOT_UPLOADED, progress: 0 }
                        : video
                )
            );

            const formData = new FormData();
            formData.append('files', itemToUpload.file); 

            try {
                const res = await retryRequest(async () => {
                    return await VideoApi.upload(
                        formData,
                        itemToUpload.playlistId??'',
                        (progress: number) => {
                            setUploadFileList((currentList: IUploadVideo[]|null) =>
                                (currentList ?? []).map(video =>
                                    video.vid === itemId
                                        ? {
                                            ...video,
                                            progress: Math.floor(progress),
                                            uploadStatus: VideoUploadStatus.UPLOADING,
                                        }
                                        : video
                                )
                            );
                        },
                        (xhr: XMLHttpRequest | null) => {
                            itemToUpload.xhrRef = xhr;
                        }
                    );
                });

          
                if (!res || !res.data || !res.data.vids || res.data.vids.length === 0) {
                    setUploadFileList((currentList: IUploadVideo[]|null) =>
                        (currentList ?? []).map(video =>
                            video.vid === itemId
                                ? {
                                    ...video,
                                    uploadStatus: VideoUploadStatus.UPLOAD_FAILED,
                                    progress: video.uploadStatus === VideoUploadStatus.UPLOADING ? video.progress : 0,
                                }
                                : video
                        )
                    );
                } else {
                    const vidFromServer = res.data.vids[0]; 
                    
                    // setSuccessedFiles((currentList: IVideo[]|null) =>   
                    //     (currentList ?? []).concat({
                    //         ...item,
                    //         vid: vidFromServer,
                    //         uploadStatus: VideoUploadStatus.UPLOAD_SUCCESS,
                    //         progress: 100,
                    //     })
                    // );

                    profileEventBus.emit(EventName.UploadVideoSuccess);

                    setUploadFileList((currentList: IUploadVideo[]|null) => 
                        (currentList ?? []).map(video =>
                            video.vid === itemId
                                ? {
                                    ...video,
                                    vid: vidFromServer,
                                    uploadStatus: VideoUploadStatus.UPLOAD_SUCCESS,
                                    progress: 100,
                                }
                                : video
                        )
                    );
                }
            } catch (error) {
                setUploadFileList((currentList: IUploadVideo[]|null) => 
                    (currentList ?? []).map(video =>
                        video.vid === itemId
                            ? {
                                ...video,
                                uploadStatus: VideoUploadStatus.UPLOAD_FAILED,
                                progress: video.uploadStatus === VideoUploadStatus.UPLOADING ? video.progress : 0,
                            }
                            : video
                    )
                );
            }
        }
    };


    const handleDelectUploadFile = (item: IUploadVideo) => {
        if (item.xhrRef) {
            item.xhrRef.abort();
        }
        setUploadFileList((currentList: IUploadVideo[] | null) => currentList?.filter(file => file.vid !== item.vid) ?? []);
    };


    return (
        <>
            <div
                className={`fixed  bottom-[12vh] right-[1vw] max-w-lg rounded-xl z-50 bg-white ${openUploadProgressModal ? 'block' : 'hidden'}`}
                style={{
                    boxShadow: '0px 2px 12px 0px rgba(0,0,0,0.5)',
                }}
            >
                {isExpand ? (
                    <div className="px-4 py-2">
                        {/* Header */}
                        <div className="flex justify-between items-center gap-8 border-b-[1px] mb-2">
                            <div className="py-1 flex items-center gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span>Uploading: {uploadFileList?.filter(item => item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS).length || 0}/{uploadFileList?.length??0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                                <div className="text-sm text-gray-500 cursor-pointer" onClick={() => setIsExpand(!isExpand)}>
                                    <IconChevronUp size={22} />
                                </div>
                                {showClose && (
                                    <div className="text-sm text-gray-500 cursor-pointer" onClick={onClose}>
                                        <IconX size={22} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload List */}
                        <div className="max-h-[30vh] overflow-y-auto scrollbar-hide">
                        {(uploadFileList ?? [])
                            .map((item, index) => (
                                <UploadProgressItem key={index} index={index} item={item} handleUpload={handleUpload} handleDelectUploadFile={handleDelectUploadFile} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-white" onClick={() => setIsExpand(true)}>
                        <div className="flex justify-center items-center">{showClose ? <IconChevronDown size={22} /> : <IconLoader size={22} className="animate-spin" />}</div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                opened={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmRefresh}
                title="Cancel upload"
                message="Are you sure you want to cancel upload?"
                confirmText="Cancel upload"
                cancelText="Close"
            />
        </>
    );
};

export default UploadProgressModal;
