// components/UploadProgressItem.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { IUploadVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import fileUploadStore from '@/store/useFileUploadStore';
import profileEventBus from '@/utils/profileEventBus';
import { EventName } from '@/types/event';
import { retryRequest } from '@/api'; // <--- **STEP 1: Import the retryRequest utility**

interface IProps {
    item: IUploadVideo;
    onDelete: (item: IUploadVideo) => void;
}

const UploadProgressItem: React.FC<IProps> = ({ item, onDelete }) => {
    const { setUploadFileList } = fileUploadStore();
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    useEffect(() => {
        if (item.uploadStatus === VideoUploadStatus.UPLOADING && !xhrRef.current) {
            handleUpload();
        }

        return () => {
            if (xhrRef.current) {
                xhrRef.current.abort();
                xhrRef.current = null;
            }
        };
    }, [item.uploadStatus, item.vid]);

    const handleUpload = async () => {
        if (!item.file) return;

        const formData = new FormData();
        formData.append('files', item.file);

        try {
            // **STEP 2: Wrap the API call with retryRequest**
            // The entire upload logic is now placed inside the retry wrapper.
            const res = await retryRequest(async () => {
                return VideoApi.upload(
                    formData,
                    item.playlistId ?? '',
                    (progress: number) => {
                        if (xhrRef.current) {
                            setUploadFileList((currentList) =>
                                (currentList ?? []).map(video =>
                                    video.vid === item.vid ? { ...video, progress: Math.floor(progress) } : video
                                )
                            );
                        }
                    },
                    (xhr: XMLHttpRequest | null) => {
                        xhrRef.current = xhr;
                    }
                );
            });

            // After all retries are successful, proceed
            xhrRef.current = null;
            if (res && res.data && res.data.vids && res.data.vids.length > 0) {
                const vidFromServer = res.data.vids[0];
                profileEventBus.emit(EventName.UploadVideoSuccess);
                setUploadFileList((currentList) =>
                    (currentList ?? []).map(video =>
                        video.vid === item.vid ? { ...video, vid: vidFromServer, uploadStatus: VideoUploadStatus.UPLOAD_SUCCESS, progress: 100 } : video
                    )
                );
            } else {
                // This will be caught by the outer catch block if all retries fail
                throw new Error("Invalid response from server after successful upload.");
            }

        } catch (error: any) {
            // This catch block now executes only after ALL retries have failed.
            xhrRef.current = null;
            
            const wasAborted = error && error.message === 'Upload aborted';
            
            // Only set to failed if it wasn't a manual cancellation.
            if (!wasAborted) {
                handleUploadFailed();
            }
        }
    };

    const handleUploadFailed = () => {
        setUploadFileList((currentList) =>
            (currentList ?? []).map(video =>
                video.vid === item.vid ? { ...video, uploadStatus: VideoUploadStatus.UPLOAD_FAILED, progress: 0 } : video
            )
        );
    };
    
    const handleCancelOrDelete = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null;
        }
        onDelete(item);
    };

    const handleRetry = () => {
        setUploadFileList((currentList) => 
            (currentList ?? []).map(video =>
                video.vid === item.vid ? { ...video, uploadStatus: VideoUploadStatus.NOT_UPLOADED, progress: 0 } : video
            )
        );
    };

    // The JSX part remains completely unchanged.
    return (
        <div className="flex items-center gap-4 py-1">
           {/* ... your JSX is correct and doesn't need changes ... */}
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm truncate pr-8 max-w-sm">{item.title}</span>
                    <span className="text-sm">
                        {/* Uploading */}
                        {item.uploadStatus === VideoUploadStatus.UPLOADING && item.progress !== 100 && (
                            <div className="flex flex-row items-center gap-2">
                                <div>{item.progress ?? 0}%</div>
                                <IconX className="text-red-500 cursor-pointer" size={18} onClick={handleCancelOrDelete} />
                            </div>
                        )}
                        {/* Upload Success */}
                        {(item.uploadStatus === VideoUploadStatus.UPLOAD_SUCCESS || (item.progress === 100 && item.uploadStatus === VideoUploadStatus.UPLOADING)) && 
                            <IconCheck className="text-green-500" size={18} />
                        }
                        {/* Upload Failed */}
                        {item.uploadStatus === VideoUploadStatus.UPLOAD_FAILED && (
                            <IconRefresh onClick={handleRetry} className="text-primary cursor-pointer" size={18} />
                        )}
                        {/* Waiting */}
                        {item.uploadStatus !== VideoUploadStatus.UPLOADING && item.uploadStatus !== VideoUploadStatus.UPLOAD_SUCCESS && item.uploadStatus !== VideoUploadStatus.UPLOAD_FAILED &&
                            <span className="text-gray-400">Waiting...</span>
                        }
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