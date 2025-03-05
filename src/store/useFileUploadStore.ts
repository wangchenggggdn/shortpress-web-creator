import { create } from 'zustand';
import { IVideo } from '@/types/video';

/**
 * Interface for file upload store state and actions
 */
interface IUploadFileStore {
    /** List of files being uploaded */
    uploadFileList: null | IVideo[];
    /** Function to update upload file list */
    setUploadFileList: (info: null | IVideo[]) => void;
    /** Whether upload progress modal is open */
    openUploadProgressModal: boolean; 
    /** Function to update upload progress modal state */
    setOpenUploadProgressModal: (result: boolean) => void; 
}

/**
 * Zustand store for managing file upload state
 */
const fileUploadStore = create<IUploadFileStore>(set => ({
    uploadFileList: null,
    setUploadFileList: info => set({ uploadFileList: info }),
    openUploadProgressModal: false,
    setOpenUploadProgressModal: result => set({ openUploadProgressModal: result }),
}));

export default fileUploadStore;
