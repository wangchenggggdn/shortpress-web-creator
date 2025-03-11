'use client';

import React, { useEffect, useRef } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import fileUploadStore from '@/store/useFileUploadStore';

interface IProps {
    item: IVideo;
    index: number;
}
/**
 * Upload progress modal component
 * Displays upload status and progress for multiple files
 * @returns React component with upload progress interface
 */
const UploadProgressItem: React.FC<IProps> = ({ index, item }) => {
    const { uploadFileList, setUploadFileList } = fileUploadStore();
    const uploadFileListRef = useRef<IVideo[] | null>();

    useEffect(() => {
        uploadFileListRef.current = uploadFileList;
    }, [uploadFileList]);

    useEffect(() => {
        handleUpload();
    }, [item.file]);

    const handleUpload = async () => {
        if (item.file && item.uploadStatus === VideoUploadStatus.NULL) {
            item.uploadStatus = VideoUploadStatus.NOT_UPLOADED;
            const formData = new FormData();
            formData.append('files', item.file);
            try {
                const res = await VideoApi.upload(formData, (progress: number) => {
                    item.progress = Math.floor(progress);
                    item.uploadStatus = VideoUploadStatus.UPLOADING;
                    setUploadFileList(uploadFileListRef.current ?? []);
                });
                if (res.code === 0) {
                    item.vid = res.data.vids[0];
                    setUploadFileList(uploadFileListRef.current ?? []);
                } else {
                    item.uploadStatus = VideoUploadStatus.UPLOAD_FAILED;
                    setUploadFileList(uploadFileListRef.current ?? []);
                }
            } catch (error) {
                item.uploadStatus = VideoUploadStatus.UPLOAD_FAILED;
                setUploadFileList(uploadFileListRef.current ?? []);
            }
        }
    };

    const handleDelectUploadFile = () => {
        setUploadFileList((uploadFileListRef.current ?? []).filter(file => file.vid !== item.vid));
    };

    return (
        <div className="flex items-center gap-4 py-1">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm truncate pr-8 max-w-sm">{item.title}</span>
                    <span className="text-sm">
                        {item.uploadStatus === VideoUploadStatus.UPLOADING && `${item.progress ?? 0}%`}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS && <IconCheck className="text-green-500" size={18} />}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && <IconX onClick={handleDelectUploadFile} className="text-red-500" size={18} />}
                        {item.progress === 0 ||
                            ((item.uploadStatus === VideoUploadStatus.NOT_UPLOADED || item.uploadStatus === VideoUploadStatus.NULL) && (
                                <span className="text-gray-400">Waiting...</span>
                            ))}
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
