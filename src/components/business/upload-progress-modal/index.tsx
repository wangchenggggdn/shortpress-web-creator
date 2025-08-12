// UploadProgressModal.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconLoader, IconX } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { IUploadVideo, VideoUploadStatus } from '@/types/video';
import ConfirmDialog from '@/components/common/confirm-dialog';
import UploadProgressItem from './components';
// No longer need VideoApi, retryRequest, profileEventBus, EventName

const MAX_UPLOAD_COUNT = 3;

const UploadProgressModal: React.FC = () => {
    const { openUploadProgressModal, uploadFileList, setUploadFileList, setOpenUploadProgressModal } = fileUploadStore();
    const [isExpand, setIsExpand] = useState(true);
    const [showClose, setShowClose] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false); // You have this state in your code, but it seems nowhere sets it to true

    // Logic to prevent accidental page closure (keep unchanged)
    useEffect(() => {
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
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploadFileList]);

    // Queue management logic (now the core responsibility of this component)
    useEffect(() => {
        checkAndTriggerUploads();
    }, [uploadFileList]); // Check if new uploads can be started whenever the list changes

    const checkAndTriggerUploads = () => {
        if (!uploadFileList) return;

        const uploadingCount = uploadFileList.filter(item => item.uploadStatus === VideoUploadStatus.UPLOADING).length;
        if (uploadingCount >= MAX_UPLOAD_COUNT) {
            return; // Concurrency is full
        }

        const canStartCount = MAX_UPLOAD_COUNT - uploadingCount;
        const waitingItems = uploadFileList.filter(item =>
            item.uploadStatus === VideoUploadStatus.NOT_UPLOADED ||
            item.uploadStatus === VideoUploadStatus.NULL
        );

        const itemsToStart = waitingItems.slice(0, canStartCount);

        if (itemsToStart.length > 0) {
            const idsToStart = itemsToStart.map(item => item.vid);
            // Only update status, delegate upload responsibility to corresponding child components
            setUploadFileList((currentList) =>
                (currentList ?? []).map(video =>
                    idsToStart.includes(video.vid)
                        ? { ...video, uploadStatus: VideoUploadStatus.UPLOADING }
                        : video
                )
            );
        }
    };

    // Check if all uploads are completed to show close button (keep unchanged)
    useEffect(() => {
        const allDone = uploadFileList?.every(item => 
            item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS || item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED
        );
        // Or if you only want to show when all are successful, use the original logic
        const allSuccess = uploadFileList?.every(item => item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS);
        setShowClose(allSuccess ?? false);
    }, [uploadFileList]);
    
    // `handleUpload` function can now be completely removed as logic has moved to child components

    // Delete/cancel operation (now only responsible for removing from list)
    const handleDeleteItem = (itemToRemove: IUploadVideo) => {
        setUploadFileList((currentList) =>
            (currentList ?? []).filter(item => item.vid !== itemToRemove.vid)
        );
    };

    const onClose = () => {
        // Here you can add a confirmation if there are still failed upload items
        setUploadFileList([]);
        setOpenUploadProgressModal(false);
    };
    
    // Confirm refresh dialog logic (keep unchanged)
    const handleConfirmRefresh = () => {
        setShowConfirmDialog(false);
        window.location.reload();
    };

    return (
        <>
            <div
                className={`fixed bottom-[12vh] right-[1vw] max-w-lg rounded-xl z-50 bg-white ${openUploadProgressModal ? 'block' : 'hidden'}`}
                style={{ boxShadow: '0px 2px 12px 0px rgba(0,0,0,0.5)' }}
            >
                {isExpand ? (
                    <div className="px-4 py-2">
                        {/* Header (keep unchanged) */}
                        <div className="flex justify-between items-center gap-8 border-b-[1px] mb-2">
                             <div className="py-1 flex items-center gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span>Uploaded: {uploadFileList?.filter(item => item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS).length || 0}/{uploadFileList?.length??0}</span>
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

                        {/* Upload List (now pass onDelete prop) */}
                        <div className="max-h-[30vh] overflow-y-auto scrollbar-hide">
                            {(uploadFileList ?? []).map((item) => (
                                <UploadProgressItem 
                                    key={item.vid} // Using unique vid as key is more reliable
                                    item={item} 
                                    onDelete={handleDeleteItem} 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // (keep unchanged)
                    <div className="p-4 bg-white" onClick={() => setIsExpand(true)}>
                        <div className="flex justify-center items-center">{showClose ? <IconChevronDown size={22} /> : <IconLoader size={22} className="animate-spin" />}</div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog (keep unchanged) */}
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