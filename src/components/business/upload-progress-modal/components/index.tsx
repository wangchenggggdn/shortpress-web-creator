'use client';

import React, { useEffect, useRef } from 'react';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import fileUploadStore from '@/store/useFileUploadStore';
import { retryRequest } from '@/api';

interface IProps {
    item: IVideo;
    index: number;
}

const UploadProgressItem: React.FC<IProps> = ({ index, item }) => {
    const { uploadFileList, setUploadFileList, playlistId } = fileUploadStore();
    const uploadFileListRef = useRef<IVideo[] | null>();
    const xhrRef = useRef<XMLHttpRequest | null>(null);

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

            const res = await retryRequest(async () => {
                return await VideoApi.upload(formData, playlistId, (progress: number) => {
                    item.progress = Math.floor(progress);
                    item.uploadStatus = VideoUploadStatus.UPLOADING;
                    setUploadFileList([...uploadFileListRef.current ?? []]);
                }, xhrRef);
            });

            if (!res) {
                item.uploadStatus = VideoUploadStatus.UPLOAD_FAILED;
            } else {
                item.vid = res.data.vids[0];
                item.uploadStatus = VideoUploadStatus.UPLOAD_SUCCESS;
            }

            setUploadFileList([...uploadFileListRef.current ?? []]);
        }
    };

    const handleDelectUploadFile = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
        }
        setUploadFileList(([...uploadFileListRef.current ?? []]).filter(file => file.vid !== item.vid));
    };

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
                                <IconX className="text-red-500" size={18} onClick={handleDelectUploadFile}></IconX>
                            </div>
                        )}
                        {/* Upload Status UPLOAD_SUCCESS */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS && <IconCheck className="text-green-500" size={18} />}

                        {/* Upload Status UPLOAD_FAILED */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && (
                            <IconRefresh
                                onClick={() => {
                                    item.uploadStatus = VideoUploadStatus.NULL;
                                    handleUpload();
                                }}
                                className="text-primary cursor-pointer"
                                size={18}
                            />
                        )}

                        {/* Upload Status NOT_UPLOADED */}
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
