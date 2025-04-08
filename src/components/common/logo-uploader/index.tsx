import { Button } from '@mantine/core';
import React from 'react';
import { useState } from 'react';

interface LogoUploaderProps {
    logo?: string;
    onFileSelect: (file: File) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = React.memo(({ logo, onFileSelect }) => {
    const [previewFile, setPreviewFile] = useState<File>();

    const handleUploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setPreviewFile(file);
                onFileSelect(file);
            }
        };
        fileInput.click();
    };

    return (
        <div>
            <h3 className="text-lg font-medium text-[#1a1b1e] mb-4">Logo</h3>
            <div className="flex items-center gap-4">
                <div className="w-32 h-32 bg-[#F4F4F7] rounded-lg flex items-center justify-center">
                    {logo && !previewFile && <img src={logo} alt="logo" className="w-full h-full object-cover rounded-lg" />}
                    {previewFile && <img src={URL.createObjectURL(previewFile)} alt="logo" className="w-full h-full object-cover rounded-lg" />}
                </div>
                <Button variant="filled" color="primary" size="md" onClick={handleUploadImage}>
                    Upload Image
                </Button>
            </div>
        </div>
    );
});

export default LogoUploader;
