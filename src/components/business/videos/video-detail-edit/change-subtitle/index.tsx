'use client';

import React, { useState } from 'react';
import { Button, Select } from '@mantine/core';
import { IconX, IconUpload, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { IVideo } from '@/types/video';

interface ChangeSubtitleProps {
    video:IVideo;
    isOpen: boolean;
    onClose: () => void;
    onSave: (languageCode: string, file: File) => Promise<boolean>;
    onBackToSubtitles: () => void;
}

const ChangeSubtitle: React.FC<ChangeSubtitleProps> = ({ 
    video,
    isOpen, 
    onClose, 
    onSave,
    onBackToSubtitles
}) => {
    // Filter out languages that are already added in subtitles
    const existingLanguages = video.subtitles ? Object.keys(video.subtitles) : [];
    const languages = [
        { value: 'en', label: 'English' },
        { value: 'zh', label: 'Chinese' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
    ].filter(lang => !existingLanguages.includes(lang.value));

    const [selectedLanguage, setSelectedLanguage] = useState(languages.length > 0 ? languages[0].value : 'en');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.srt,.vtt';
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                validateAndSetFile(file);
            }
        };
        fileInput.click();
    };

    const validateAndSetFile = (file: File) => {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith('.srt') || fileName.endsWith('.vtt')) {
            setSelectedFile(file);
        } else {
            alert('Please select a valid subtitle file (.srt or .vtt)');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        await onSave(selectedLanguage, selectedFile) && onClose();;
        setIsUploading(false);
    };

    const handleBack = () => {
        onBackToSubtitles();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 bg-white">
                <div className="flex items-center gap-3">
                    <Button variant="subtle" color="gray" style={
                        {
                            padding: '0px',
                        }
                    } onClick={handleBack} className="hover:bg-gray-100">
                        <IconArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Add Subtitle</h2>
                        <p className="w-52 text-sm line-clamp-1 break-words">{video.title}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-80 bg-layout flex flex-col h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Language Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <Select
                                value={selectedLanguage}
                                onChange={(value) => setSelectedLanguage(value || 'en')}
                                data={languages}
                                variant="filled"
                            />
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtitle File</label>
                            {!selectedFile ? (
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                    onClick={handleFileSelect}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <div className="flex flex-col items-center space-y-4">
                                        <IconUpload size={48} className="text-gray-400" />
                                        <div>
                                            <p className="text-gray-700 font-medium">Click to upload or drag & drop your file here</p>
                                            <p className="text-sm text-gray-500 mt-1">Support format: .vtt, .srt</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-lg px-4 pb-4 relative">
                                    <div className='absolute right-2 z-10'>
                                        <Button 
                                            variant="subtle" 
                                            color="black" 
                                            onClick={() => setSelectedFile(null)}
                                            style={{
                                                padding: '0px',

                                            }}
                                            className='bg-white'
                                        >
                                            <IconTrash size={16} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-center justify-center space-y-3 pt-8">
                                        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 text-center">{selectedFile.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-white flex-shrink-0">
                    <Button 
                        onClick={handleSave}
                        loading={isUploading}
                        disabled={!selectedFile}
                        fullWidth
                        color="primary"
                    >
                        Upload Subtitle
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangeSubtitle; 