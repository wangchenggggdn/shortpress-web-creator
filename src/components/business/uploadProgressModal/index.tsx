'use client';

import React, { useEffect, useState } from 'react';
import { IconChevronDown, IconChevronUp, IconLoader, IconX } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { VideoUploadStatus } from '@/types/video';
import ConfirmDialog from '@/components/common/confirmDialog';
import UploadProgressItem from '../components';

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

    // 监听页面刷新事件
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
                // setShowConfirmDialog(true);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploadFileList]);

    // 检查是否所有文件都上传成功
    useEffect(() => {
        if (uploadFileList?.map(item => item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS).every(item => item)) {
            setShowClose(true);
        }
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
                            <div className="py-1 ">Uploading</div>
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
                        {(uploadFileList ?? [])
                            .slice()
                            .reverse()
                            .map((item, index) => (
                                <UploadProgressItem key={index} index={index} item={item} />
                            ))}
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
