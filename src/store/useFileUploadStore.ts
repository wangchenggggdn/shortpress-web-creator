import { create } from 'zustand';
import { IUploadVideo, IVideo } from '@/types/video';

/**
 * Interface for file upload store state and actions
 */
interface IUploadFileStore {
    /** List of files being uploaded */
    uploadFileList: null | IUploadVideo[];
    /** Function to update upload file list */
    setUploadFileList: (updater: null | IUploadVideo[] | ((prevList: null | IUploadVideo[]) => null | IUploadVideo[])) => void;
    successedFiles: null | IUploadVideo[];
    /** Function to update successed files */
    setSuccessedFiles: (files: null | IUploadVideo[] | ((prevList: null | IUploadVideo[]) => null | IUploadVideo[])) => void;
    /** Whether upload progress modal is open */
    openUploadProgressModal: boolean;
    /** Function to update upload progress modal state */
    setOpenUploadProgressModal: (result: boolean) => void;
    /** Playlist ID */
    playlistId: string | null;
    /** Function to update playlist ID */
    setPlaylistId: (id: string | null | ((prevId: string | null) => string | null)) => void;
    /** Maximum file size limit */
    maxLimit: number;
    /** Function to update maximum file size limit */
    setMaxLimit: (limit: number) => void;
}

/**
 * Zustand store for managing file upload state
 */
const fileUploadStore = create<IUploadFileStore>(set => ({
    uploadFileList: null,
    setUploadFileList: (updater) => {
        if (typeof updater === 'function') {
            set(state => ({ uploadFileList: updater(state.uploadFileList) }));
        } else {
            set({ uploadFileList: updater });
        }
    },
    successedFiles: null,
    setSuccessedFiles: (files) => {
        if (typeof files === 'function') {
            set(state => ({ successedFiles: files(state.successedFiles) }));
        } else {
            set({ successedFiles: files });
        }
    },
    openUploadProgressModal: false,
    setOpenUploadProgressModal: result => set({ openUploadProgressModal: result }),
    playlistId: null,
    setPlaylistId: (id) => {
        if (typeof id === 'function') {
            set(state => ({ playlistId: id(state.playlistId) }));
        } else {
            set({ playlistId: id });
        }
    },
    maxLimit: 100000,
    setMaxLimit: limit => set({ maxLimit: limit }),
}));

export default fileUploadStore;
