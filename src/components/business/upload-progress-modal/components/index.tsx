'use client';

import React from 'react';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { IUploadVideo,  VideoUploadStatus } from '@/types/video';

interface IProps {
    item: IUploadVideo;
    index: number;
    handleUpload: (item: IUploadVideo, isRefresh: boolean) => void;
    handleDelectUploadFile: (item: IUploadVideo) => void;
}

const UploadProgressItem: React.FC<IProps> = ({ index, item, handleUpload, handleDelectUploadFile }) => {
    return (
        <div className="flex items-center gap-4 py-1">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm truncate pr-8 max-w-sm">{item.title}</span>
                    <span className="text-sm">
                        {/* Upload Status UPLOADING */}
                        {item.uploadStatus === VideoUploadStatus.UPLOADING && (
                            <div className="flex flex-row gap-2">
                                <div>{item.progress ?? 0}%</div>
                                <IconX className="text-red-500" size={18} onClick={() => handleDelectUploadFile(item)}></IconX>
                            </div>
                        )}
                        {/* Upload Status UPLOAD_SUCCESS */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS && <IconCheck className="text-green-500" size={18} />}

                        {/* Upload Status UPLOAD_FAILED */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && (
                            <IconRefresh
                                onClick={() => {
                                    handleUpload(item,true);
                                }}
                                className="text-primary cursor-pointer"
                                size={18}
                            />
                        )}

                        {/* Upload Status NOT_UPLOADED */}
                        {(item?.progress??0) === 0 && <span className="text-gray-400">Waiting...</span>}
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
    );
};

export default UploadProgressItem;
