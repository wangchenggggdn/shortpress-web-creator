import { Button } from '@mantine/core';
import React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LogoUploaderProps {
    logo?: string;
    onFileSelect: (file: File) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = React.memo(({ logo, onFileSelect }) => {
    const [previewFile, setPreviewFile] = useState<File>();

    const validateImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            // Validate file format
            if (file.type !== 'image/png') {
                toast.warning('Please upload a PNG format image');
                resolve(false);
                return;
            }

            // Validate image dimensions
            const img = new Image();
            img.onload = () => {
                if (img.width !== 512 || img.height !== 512) {
                    toast.warning('Image dimensions must be 512x512 pixels');
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            img.onerror = () => {
                toast.warning('Unable to read image file');
                resolve(false);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleUploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png';
        fileInput.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const isValid = await validateImage(file);
                if (isValid) {
                    setPreviewFile(file);
                    onFileSelect(file);
                }
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
            <p className="text-sm text-gray-500 mt-2">Please upload a 512x512 pixel PNG image</p>
        </div>
    );
});

export default LogoUploader;
