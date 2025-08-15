'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Select, Text, Group, Badge, ActionIcon, Modal } from '@mantine/core';
import { IconX, IconUpload, IconArrowLeft, IconTrash, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { IVideo } from '@/types/video';

/**
 * 字幕文件处理接口
 */
interface ISubtitleFile {
    file: File;
    filename: string;
    detectedLanguage?: string;
    selectedLanguage?: string;
    format: string;
    isFormatValid: boolean;
    isLanguageSelected: boolean;
    isLanguageAlreadyExists?: boolean;
    status: 'pending' | 'processing' | 'ready' | 'error';
}

/**
 * 语言选项接口
 */
interface ILanguageOption {
    value: string;
    label: string;
    nativeName?: string;
}

interface ChangeSubtitleProps {
    video: IVideo;
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
    const languageOptions: ILanguageOption[] = useMemo(() => {
        const existingLanguages = video.subtitles ? Object.keys(video.subtitles) : [];
        
        const allLanguages: ILanguageOption[] = [
            { value: 'en', label: 'English', nativeName: 'English' },
            { value: 'zh', label: 'Chinese', nativeName: '中文' },
            { value: 'zh-CN', label: 'Chinese Simplified (zh-CN)', nativeName: '简体中文' },
            { value: 'zh-TW', label: 'Chinese Traditional (zh-TW)', nativeName: '繁體中文' },
            { value: 'ja', label: 'Japanese', nativeName: '日本語' },
            { value: 'ko', label: 'Korean', nativeName: '한국어' },
            { value: 'es', label: 'Spanish', nativeName: 'Español' },
            { value: 'fr', label: 'French', nativeName: 'Français' },
            { value: 'de', label: 'German', nativeName: 'Deutsch' },
            { value: 'ru', label: 'Russian', nativeName: 'Русский' },
            { value: 'pt', label: 'Portuguese', nativeName: 'Português' },
            { value: 'it', label: 'Italian', nativeName: 'Italiano' },
            { value: 'ar', label: 'Arabic', nativeName: 'العربية' },
            { value: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
            { value: 'th', label: 'Thai', nativeName: 'ไทย' },
            { value: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt' },
            { value: 'tr', label: 'Turkish', nativeName: 'Türkçe' },
            { value: 'uk', label: 'Ukrainian', nativeName: 'Українська' },
            { value: 'pl', label: 'Polish', nativeName: 'Polski' },
            { value: 'cs', label: 'Czech', nativeName: 'Čeština' },
            { value: 'nl', label: 'Dutch', nativeName: 'Nederlands' },
            { value: 'fil', label: 'Filipino', nativeName: 'Filipino' },
            { value: 'fi', label: 'Finnish', nativeName: 'Suomi' },
            { value: 'he', label: 'Hebrew', nativeName: 'עברית' },
            { value: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia' },
            { value: 'no', label: 'Norwegian', nativeName: 'Norsk' },
            { value: 'ro', label: 'Romanian', nativeName: 'Română' },
            { value: 'sk', label: 'Slovak', nativeName: 'Slovenčina' },
        ];

        // Filter out existing subtitle languages
        return allLanguages;
    }, [video.subtitles]);

    // Supported subtitle file formats
    //const supportedFormats = ['.srt', '.vtt', '.ass', '.ssa', '.sub'];
    const supportedFormats = ['.srt', '.vtt'];

    // State management
    const [uploadedFiles, setUploadedFiles] = useState<ISubtitleFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * 从文件名检测语言代码
     */
    const detectLanguageFromFilename = (filename: string): string | undefined => {
        const name = filename.toLowerCase();
        
        // Common language code patterns
        const languagePatterns = [
            { pattern: /\.(en|eng|english)\./i, code: 'en' },
            { pattern: /\.(zh|chinese|cn)\./i, code: 'zh' },
            { pattern: /\.(zh-cn|zh_cn|simplified)\./i, code: 'zh-CN' },
            { pattern: /\.(zh-tw|zh_tw|traditional)\./i, code: 'zh-TW' },
            { pattern: /\.(ja|japanese|jp)\./i, code: 'ja' },
            { pattern: /\.(ko|korean|kr)\./i, code: 'ko' },
            { pattern: /\.(es|spanish|sp)\./i, code: 'es' },
            { pattern: /\.(fr|french|fr)\./i, code: 'fr' },
            { pattern: /\.(de|german|de)\./i, code: 'de' },
            { pattern: /\.(ru|russian|ru)\./i, code: 'ru' },
            { pattern: /\.(pt|portuguese|pt)\./i, code: 'pt' },
            { pattern: /\.(it|italian|it)\./i, code: 'it' },
            { pattern: /\.(ar|arabic|ar)\./i, code: 'ar' },
            { pattern: /\.(hi|hindi|in)\./i, code: 'hi' },
            { pattern: /\.(th|thai|th)\./i, code: 'th' },
            { pattern: /\.(vi|vietnamese|vn)\./i, code: 'vi' },
            { pattern: /\.(tr|turkish|tr)\./i, code: 'tr' },
            { pattern: /\.(uk|ukrainian|ua)\./i, code: 'uk' },
            { pattern: /\.(pl|polish|pl)\./i, code: 'pl' },
            { pattern: /\.(cs|czech|cz)\./i, code: 'cs' },
            { pattern: /\.(nl|dutch|nl)\./i, code: 'nl' },
            { pattern: /\.(fil|filipino|ph)\./i, code: 'fil' },
            { pattern: /\.(fi|finnish|fi)\./i, code: 'fi' },
            { pattern: /\.(he|hebrew|il)\./i, code: 'he' },
            { pattern: /\.(id|indonesian|id)\./i, code: 'id' },
            { pattern: /\.(no|norwegian|no)\./i, code: 'no' },
            { pattern: /\.(ro|romanian|ro)\./i, code: 'ro' },
            { pattern: /\.(sk|slovak|sk)\./i, code: 'sk' },
        ];

        for (const { pattern, code } of languagePatterns) {
            if (pattern.test(name)) {
                return code;
            }
        }

        return undefined;
    };

    /**
     * 验证文件格式
     */
    const validateFileFormat = (filename: string): boolean => {
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return supportedFormats.includes(extension);
    };

    /**
     * 检查文件是否已存在（防止重复添加）
     */
    const isFileAlreadyAdded = (file: File): boolean => {
        return uploadedFiles.some(existingFile => 
            existingFile.file.name === file.name && 
            existingFile.file.size === file.size &&
            existingFile.file.lastModified === file.lastModified
        );
    };

    /**
     * 处理文件上传
     */
    const handleFileUpload = useCallback((files: FileList) => {
        const newFiles: ISubtitleFile[] = [];
        
        Array.from(files).forEach(file => {
            // Check if file already exists
            if (isFileAlreadyAdded(file)) {
                return; // Skip duplicate file
            }

            const filename = file.name;
            const detectedLanguage = detectLanguageFromFilename(filename);
            const format = filename.substring(filename.lastIndexOf('.')).toLowerCase();
            const isFormatValid = validateFileFormat(filename);
            
            // Check if detected language is in available options
            const availableLanguage = detectedLanguage && languageOptions.some(opt => opt.value === detectedLanguage) 
                ? detectedLanguage 
                : undefined;
            
            newFiles.push({
                file,
                filename,
                detectedLanguage: availableLanguage,
                selectedLanguage: availableLanguage,
                format,
                isFormatValid,
                isLanguageSelected: !!availableLanguage,
                isLanguageAlreadyExists: availableLanguage ? !!(video.subtitles && video.subtitles[availableLanguage]) : false,
                status: 'pending'
            });
        });

        if (newFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...newFiles]);
        }
    }, [languageOptions]);

    /**
     * 处理拖拽上传
     */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    }, [handleFileUpload]);

    /**
     * 处理拖拽悬停
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    /**
     * 处理拖拽离开
     */
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    /**
     * 处理文件选择
     */
    const handleFileSelect = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = supportedFormats.join(',');
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                handleFileUpload(target.files);
            }
        };
        input.click();
    }, [handleFileUpload]);

    /**
     * 更新文件语言选择
     */
    const handleLanguageChange = (fileIndex: number, languageCode: string) => {
        setUploadedFiles(prev => prev.map((file, index) => 
            index === fileIndex 
                ? { 
                    ...file, 
                    selectedLanguage: languageCode, 
                    isLanguageSelected: true,
                    isLanguageAlreadyExists: !!(video.subtitles && video.subtitles[languageCode])
                }
                : file
        ));
    };

    /**
     * 移除上传的文件
     */
    const handleRemoveFile = (fileIndex: number) => {
        setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    };

    /**
     * 清除所有上传的文件
     */
    const handleClearAll = () => {
        setUploadedFiles([]);
    };

    /**
     * 保存所有字幕文件
     */
    const handleSaveAll = async () => {
        // Filter out valid files (correct format, language selected, and language not already exists)
        const validFiles = uploadedFiles.filter(file => 
            file.isFormatValid && file.isLanguageSelected && file.selectedLanguage && !file.isLanguageAlreadyExists
        );

        if (validFiles.length === 0) {
            return;
        }

        setIsUploading(true);
        
        try {
            // Upload files one by one
            for (const file of validFiles) {
                if (file.selectedLanguage) {
                    await onSave(file.selectedLanguage, file.file);
                }
            }
            
            // Close modal after successful upload
            onClose();
        } catch (error) {
            console.error('上传字幕文件失败:', error);
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * 检查是否可以保存
     */
    const canSave = uploadedFiles.some(file => 
        file.isFormatValid && file.isLanguageSelected && !file.isLanguageAlreadyExists
    );

    /**
     * 获取需要语言选择的文件数量
     */
    const filesNeedingLanguage = uploadedFiles.filter(file => 
        file.isFormatValid && !file.isLanguageSelected
    ).length;

    /**
     * 获取格式错误的文件数量
     */
    const filesWithInvalidFormat = uploadedFiles.filter(file => !file.isFormatValid).length;

    /**
     * 获取语言已存在的文件数量
     */
    const filesWithExistingLanguage = uploadedFiles.filter(file => file.isLanguageAlreadyExists).length;

    const handleBack = () => {
        onBackToSubtitles();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 bg-white">
                <div className="flex items-center gap-3">
                    <Button variant="subtle" color="gray" style={{
                        padding: '0px',
                    }} onClick={handleBack} className="hover:bg-gray-100">
                        <IconArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Add Subtitles</h2>
                        <p className="w-52 text-sm line-clamp-1 break-words">{video.title}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-[460px] bg-layout flex flex-col h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtitle Files</label>
                            
                            {/* Drag & Drop Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                                    isDragOver 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={handleFileSelect}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <IconUpload size={32} className="mx-auto mb-3 text-gray-400" />
                                <Text size="sm" fw={500} mb={1}>
                                    Click to select or drag subtitle files here
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Supported formats: {supportedFormats.join(', ')}
                                </Text>
                            </div>
                        </div>

                        {/* File Processing List */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-4">
                                <Text size="sm" fw={500} c="dimmed">File Processing List</Text>
                                
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b">
                                        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-700">
                                            <div className="col-span-4">Filename</div>
                                            <div className="col-span-3 text-center">Language</div>
                                            <div className="col-span-3 text-center">Status</div>
                                            <div className="col-span-2 text-center">Action</div>
                                        </div>
                                    </div>
                                    
                                    <div className="divide-y">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="px-4 py-3 hover:bg-gray-50">
                                                <div className="grid grid-cols-12 gap-3 items-center">
                                                    {/* Filename */}
                                                    <div className="col-span-4">
                                                        <Text size="xs" className="truncate" title={file.filename}>
                                                            {file.filename}
                                                        </Text>
                                                    </div>
                                                    
                                                    {/* Language Selection */}
                                                    <div className="col-span-3">
                                                        {file.isFormatValid ? (
                                                            <Select
                                                                data={languageOptions}
                                                                value={file.selectedLanguage || ''}
                                                                onChange={(value) => handleLanguageChange(index, value || '')}
                                                                placeholder="Please select language"
                                                                searchable
                                                                clearable
                                                                size="xs"
                                                                styles={{
                                                                    input: {
                                                                        borderColor: !file.isLanguageSelected ? '#ef4444' : undefined,
                                                                        '&:focus': {
                                                                            borderColor: !file.isLanguageSelected ? '#ef4444' : undefined,
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <Text size="xs" c="red">-</Text>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Status/Format */}
                                                    <div className="col-span-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {file.isFormatValid ? (
                                                                <>
                                                                    <IconCheck size={12} className="text-green-500" />
                                                                    <Text size="xs" c="green">{file.format}</Text>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <IconAlertCircle size={12} className="text-red-500" />
                                                                    <Text size="xs" c="red">Invalid format</Text>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Actions */}
                                                    <div className="col-span-2">
                                                        <div className="flex items-center justify-center">
                                                            <ActionIcon
                                                                onClick={() => handleRemoveFile(index)}
                                                                color="red"
                                                                variant="subtle"
                                                                size="xs"
                                                                title="Remove file"
                                                            >
                                                                <IconX size={12} />
                                                            </ActionIcon>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Language Already Exists Warning - Full Width */}
                                                {file.isLanguageAlreadyExists && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-red-500">
                                                        <IconAlertCircle size={14} />
                                                        <span> Language already exists. Please delete existing subtitle first.</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Notifications - Show only one priority message */}
                                <div>
                                    {filesWithInvalidFormat > 0 ? (
                                        <div className="flex items-center gap-2 text-xs text-red-500">
                                            <IconAlertCircle size={14} />
                                            <span>{filesWithInvalidFormat} files have invalid format</span>
                                        </div>
                                    ) : filesWithExistingLanguage > 0 ? (
                                        <div className="flex items-center gap-2 text-xs text-red-500">
                                            <IconAlertCircle size={14} />
                                            <span>{filesWithExistingLanguage} files have existing language - delete existing subtitle first</span>
                                        </div>
                                    ) : filesNeedingLanguage > 0 ? (
                                        <div className="flex items-center gap-2 text-xs text-red-500">
                                            <IconAlertCircle size={14} />
                                            <span>{filesNeedingLanguage} files need language selection</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-white flex-shrink-0 space-y-3">
                    {uploadedFiles.length > 0 && (
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={handleClearAll}
                                leftSection={<IconTrash size={16} />}
                                size="sm"
                            >
                                Clear All
                            </Button>
                            
                            <Text size="xs" c="dimmed">
                                {uploadedFiles.filter(f => f.isFormatValid && f.isLanguageSelected && !f.isLanguageAlreadyExists).length} files ready to upload
                            </Text>
                        </div>
                    )}
                    
                    <Button 
                        onClick={handleSaveAll}
                        loading={isUploading}
                        disabled={!canSave}
                        fullWidth
                        color="primary"
                        leftSection={<IconCheck size={16} />}
                    >
                        {canSave 
                            ? `Confirm Add ${uploadedFiles.filter(f => f.isFormatValid && f.isLanguageSelected && !f.isLanguageAlreadyExists).length} Subtitles`
                            : 'Please select language for all files or delete existing subtitles'
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangeSubtitle; 