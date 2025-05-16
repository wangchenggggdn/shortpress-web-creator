'use client';

import React, { useEffect, useRef } from 'react';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { IVideo, VideoUploadStatus } from '@/types/video';
import VideoApi from '@/api/video';
import fileUploadStore from '@/store/useFileUploadStore';
import { retryRequest } from '@/api';
import { EventName } from '@/types/event';
import profileEventBus from '@/utils/profileEventBus';

interface IProps {
    item: IVideo;
    index: number;
}

const UploadProgressItem: React.FC<IProps> = ({ index, item }) => {
    const { uploadFileList, setUploadFileList, playlistId,setSuccessedFiles } = fileUploadStore();
    const uploadFileListRef = useRef<IVideo[] | null>();
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    useEffect(() => {
        uploadFileListRef.current = uploadFileList;
    }, [uploadFileList]);

    useEffect(() => {
        handleUpload(item);
    }, [item.file]);

    const handleUpload = async (itemToUpload: IVideo, isRefresh: boolean = false) => { 
        const itemId = itemToUpload.vid;

        if (itemToUpload.file && (itemToUpload.uploadStatus === VideoUploadStatus.NULL || isRefresh)) {
            setUploadFileList((currentList: IVideo[] | null) => 
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
                        playlistId,
                        (progress: number) => {
                            setUploadFileList((currentList: IVideo[]|null) =>
                                (currentList ?? []).map(video =>
                                    video.title === item.title
                                        ? {
                                            ...video,
                                            progress: Math.floor(progress),
                                            uploadStatus: VideoUploadStatus.UPLOADING,
                                        }
                                        : video
                                )
                            );
                        },
                        xhrRef
                    );
                });

          
                if (!res || !res.data || !res.data.vids || res.data.vids.length === 0) {
                    setUploadFileList((currentList: IVideo[]|null) =>
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

                    setUploadFileList((currentList: IVideo[]|null) => 
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
                setUploadFileList((currentList: IVideo[]|null) => 
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


    const handleDelectUploadFile = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
        }
        setUploadFileList((currentList: IVideo[] | null) => currentList?.filter(file => file.vid !== item.vid) ?? []);
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
                                    handleUpload(item,true);
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
