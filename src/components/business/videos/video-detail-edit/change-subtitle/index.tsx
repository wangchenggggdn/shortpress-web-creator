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
    // 语言选项列表 - 显示英文，过滤掉已有字幕的语言
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
        ];

        // 过滤掉已有字幕的语言
        return allLanguages.filter(lang => !existingLanguages.includes(lang.value));
    }, [video.subtitles]);

    // 支持的字幕文件格式
    const supportedFormats = ['.srt', '.vtt', '.ass', '.ssa', '.sub'];

    // 状态管理
    const [uploadedFiles, setUploadedFiles] = useState<ISubtitleFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * 从文件名检测语言代码
     */
    const detectLanguageFromFilename = (filename: string): string | undefined => {
        const name = filename.toLowerCase();
        
        // 常见的语言代码模式
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
            // 检查文件是否已存在
            if (isFileAlreadyAdded(file)) {
                return; // 跳过重复文件
            }

            const filename = file.name;
            const detectedLanguage = detectLanguageFromFilename(filename);
            const format = filename.substring(filename.lastIndexOf('.')).toLowerCase();
            const isFormatValid = validateFileFormat(filename);
            
            // 检查检测到的语言是否在可用选项中
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
                ? { ...file, selectedLanguage: languageCode, isLanguageSelected: true }
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
        // 过滤出有效的文件（格式正确且已选择语言）
        const validFiles = uploadedFiles.filter(file => 
            file.isFormatValid && file.isLanguageSelected && file.selectedLanguage
        );

        if (validFiles.length === 0) {
            return;
        }

        setIsUploading(true);
        
        try {
            // 逐个上传文件
            for (const file of validFiles) {
                if (file.selectedLanguage) {
                    await onSave(file.selectedLanguage, file.file);
                }
            }
            
            // 上传成功后关闭模态框
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
        file.isFormatValid && file.isLanguageSelected
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
            <div className="w-96 bg-layout flex flex-col h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* 文件上传区域 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Subtitle Files</label>
                            
                            {/* 拖拽上传区域 */}
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

                        {/* 文件处理列表 */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-4">
                                <Text size="sm" fw={500} c="dimmed">File Processing List</Text>
                                
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b">
                                        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-700">
                                            <div className="col-span-5">Filename</div>
                                            <div className="col-span-4">Language</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-1">Action</div>
                                        </div>
                                    </div>
                                    
                                    <div className="divide-y">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="px-4 py-3 hover:bg-gray-50">
                                                <div className="grid grid-cols-12 gap-3 items-center">
                                                    {/* 文件名 */}
                                                    <div className="col-span-5">
                                                        <Text size="xs" className="truncate" title={file.filename}>
                                                            {file.filename}
                                                        </Text>
                                                    </div>
                                                    
                                                    {/* 语言选择 */}
                                                    <div className="col-span-4">
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
                                                    
                                                    {/* 状态/格式 */}
                                                    <div className="col-span-2">
                                                        <div className="flex items-center gap-1">
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
                                                    
                                                    {/* 操作 */}
                                                    <div className="col-span-1">
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
                                        ))}
                                    </div>
                                </div>

                                {/* 状态提示 */}
                                <div className="space-y-2">
                                    {filesNeedingLanguage > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-orange-600">
                                            <IconAlertCircle size={14} />
                                            <span>{filesNeedingLanguage} files need language selection</span>
                                        </div>
                                    )}
                                    {filesWithInvalidFormat > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-red-600">
                                            <IconAlertCircle size={14} />
                                            <span>{filesWithInvalidFormat} files have invalid format</span>
                                        </div>
                                    )}
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
                                {uploadedFiles.filter(f => f.isFormatValid && f.isLanguageSelected).length} files ready to upload
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
                            ? `Confirm Add ${uploadedFiles.filter(f => f.isFormatValid && f.isLanguageSelected).length} Subtitles`
                            : 'Please select language for all files'
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChangeSubtitle; 