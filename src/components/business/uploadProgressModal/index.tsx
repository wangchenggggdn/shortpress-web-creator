'use client';

import React, { useEffect, useState } from 'react';
import { IconCheck, IconChevronDown, IconChevronUp, IconLoader, IconX } from '@tabler/icons-react';
import fileUploadStore from '@/store/useFileUploadStore';
import { VideoUploadStatus } from '@/types/video';

/**
 * Upload progress modal component
 * Displays upload status and progress for multiple files
 * @returns React component with upload progress interface
 */
const UploadProgressModal: React.FC = () => {
    const { openUploadProgressModal, uploadFileList, setUploadFileList, setOpenUploadProgressModal } = fileUploadStore();
    const [isExpand, setIsExpand] = useState(true);
    const [showClose, setShowClose] = useState(false);

    // Check if all files have been uploaded successfully
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

    return (
        <div
            className={`fixed  top-[12vh] right-[1vw] max-w-lg rounded-xl z-50 bg-white ${openUploadProgressModal ? 'block' : 'hidden'}`}
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
                    {(uploadFileList ?? []).map((item, index) => (
                        <div key={index} className="flex items-center gap-4 py-1">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm truncate pr-8 max-w-sm">{item.title}</span>
                                    <span className="text-sm">
                                        {item.uploadStatus === VideoUploadStatus.UPLOADING && `${item.progress ?? 0}%`}
                                        {item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS && <IconCheck className="text-green-500" size={18} />}
                                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && <IconX className="text-red-500" size={18} />}
                                        {item.progress === 0 || (item.uploadStatus === VideoUploadStatus.NOT_UPLOADED && <span className="text-gray-400">Waiting...</span>)}
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                {item.uploadStatus === VideoUploadStatus.UPLOADING && (
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${item.progress ?? 0}%` }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 bg-white" onClick={() => setIsExpand(true)}>
                    <div className="flex justify-center items-center">{showClose ? <IconChevronDown size={22} /> : <IconLoader size={22} className="animate-spin" />}</div>
                </div>
            )}
        </div>
    );
};

export default UploadProgressModal;
