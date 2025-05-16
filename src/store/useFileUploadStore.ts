import { create } from 'zustand';
import { IVideo } from '@/types/video';

/**
 * Interface for file upload store state and actions
 */
interface IUploadFileStore {
    /** List of files being uploaded */
    uploadFileList: null | IVideo[];
    /** Function to update upload file list */
    setUploadFileList: (updater: null | IVideo[] | ((prevList: null | IVideo[]) => null | IVideo[])) => void;
    successedFiles: null | IVideo[];
    /** Function to update successed files */
    setSuccessedFiles: (files: null | IVideo[] | ((prevList: null | IVideo[]) => null | IVideo[])) => void;
    /** Whether upload progress modal is open */
    openUploadProgressModal: boolean;
    /** Function to update upload progress modal state */
    setOpenUploadProgressModal: (result: boolean) => void;
    /** Playlist ID */
    playlistId: string | null;
    /** Function to update playlist ID */
    setPlaylistId: (id: string | null) => void;
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
    setPlaylistId: id => set({ playlistId: id }),
    maxLimit: 100000,
    setMaxLimit: limit => set({ maxLimit: limit }),
}));

export default fileUploadStore;
