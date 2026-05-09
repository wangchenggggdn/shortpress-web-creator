'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { TextInput, Textarea, Button, Select, MultiSelect, Tooltip, Tabs, ScrollArea } from '@mantine/core';
import { IconX, IconInfoCircle, IconSparkles } from '@tabler/icons-react';
import { Playlist, PlaylistStatus } from '@/types/playlist';
import { PlaylistArgs } from '@/api/args';
import PlaylistApi from '@/api/playlist';
import userStore from '@/store/useUserStore';
import { toast } from 'sonner';
import { SupportedLanguage } from '@/types/translation';
import { VideoUtmSource } from '@/types/video';
import { withResMediaCacheBust } from '@/utils/mediaUrl';

interface PlaylistDetailEditProps {
    playlistOld?: Playlist;
    isLoading?: boolean;
    onClose: () => void;
    onSave: (playlistData: PlaylistArgs.Modify, websiteId?: string, coverFile?: File) => Promise<boolean>;
}

// Source 标识符（用于显示 playlist 原始数据）
const SOURCE_TAB = 'source';

// 语言配置
const LANGUAGES = [
    { code: SOURCE_TAB, label: 'Source', isSource: true },
    { code: SupportedLanguage.ZH_TW, label: '繁體中文' },
    { code: SupportedLanguage.EN, label: 'English' },
    { code: SupportedLanguage.ZH_CN, label: '简体中文' },
    { code: SupportedLanguage.JA, label: '日本語' },
    { code: SupportedLanguage.KO, label: '한국어' },
    { code: SupportedLanguage.DE, label: 'Deutsch' },
    { code: SupportedLanguage.FR, label: 'Français' },
    { code: SupportedLanguage.ID, label: 'Indonesia' },
];

const PlaylistDetailEdit: React.FC<PlaylistDetailEditProps> = ({ playlistOld = { status: 2 } as Playlist, onClose, onSave, isLoading = false }) => {
    const [coverFile, setCoverFile] = useState<File>();
    const [playlist, setPlaylist] = useState<Playlist>(playlistOld);
    const [isTranslating, setIsTranslating] = useState(false);
    const [hasI18nData, setHasI18nData] = useState(false);
    const [activeLanguage, setActiveLanguage] = useState<string>(SOURCE_TAB);
    const [i18nData, setI18nData] = useState<Map<string, PlaylistArgs.I18nItem>>(new Map());
    const [sourceModified, setSourceModified] = useState(false);
    const [lastTranslatedSource, setLastTranslatedSource] = useState<string>('');
    const { userInfo } = userStore();
    const isEdit = !!playlistOld.playlistId;

    useEffect(() => {
        if (isEdit && playlistOld.playlistId) {
            // 加载基本信息
            PlaylistApi.get(playlistOld.playlistId).then(res => {
                setPlaylist(prevPlaylist => ({
                    ...prevPlaylist,
                    ...res.data,
                    seo: {
                        ...(prevPlaylist.seo ?? {}),
                        ...(res.data.seo ?? {}),
                    },
                }));
            });

            // 加载多语言数据
            PlaylistApi.getI18n(playlistOld.playlistId)
                .then(res => {
                    if (res.code === 0 && res.data && res.data.length > 0) {
                        const dataMap = new Map<string, PlaylistArgs.I18nItem>();
                        res.data.forEach(item => {
                            dataMap.set(item.language, item);
                        });
                        setI18nData(dataMap);
                        setHasI18nData(true); // 标记为多语言版本
                    } else {
                        setHasI18nData(false);
                    }
                })
                .catch(err => {
                    console.error('Failed to load i18n data:', err);
                    setHasI18nData(false);
                });
        }
    }, [playlistOld.playlistId, isEdit]);

    const handleInputChange = useCallback((field: keyof Playlist, value: any) => {
        setPlaylist(prevPlaylist => ({
            ...prevPlaylist,
            [field]: value,
        }));
    }, []);

    const handleSeoChange = useCallback((field: 'title' | 'description' | 'keywords', value: string) => {
        setPlaylist(prevPlaylist => ({
            ...prevPlaylist,
            seo: {
                ...(prevPlaylist.seo ?? {}),
                [field]: value,
            },
        }));
    }, []);

    const handleSave = async () => {
        try {
            // 验证 title 必填
            if (!playlist.title || playlist.title.trim() === '') {
                toast.error('Title is required');
                return;
            }

            if (isEdit) {
                // 编辑模式：使用 onSave 回调保存基本信息
                const success = await onSave(
                    {
                        ...playlist,
                        playlistId: playlist.playlistId ?? '',
                    },
                    userInfo?.website?.siteId,
                    coverFile
                );

                if (!success) {
                    return;
                }

                // 如果有多语言数据，保存多语言数据
                if (playlist.playlistId && i18nData.size > 0) {
                    const dataArray = Array.from(i18nData.values());
                    const i18nResponse = await PlaylistApi.batchModifyI18n(dataArray);

                    if (i18nResponse.code !== 0) {
                        toast.error(i18nResponse.info || 'Failed to save translations');
                        return;
                    }
                }
            } else {
                // 创建模式：使用 onSave 回调
                const success = await onSave(
                    {
                        ...playlist,
                        playlistId: '',
                    },
                    userInfo?.website?.siteId,
                    coverFile
                );

                if (!success) {
                    return;
                }
            }

            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handleUploadImage = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/webm';
        fileInput.onchange = (e: any) => {
            if (e.target.files && e.target.files.length > 0) {
                setCoverFile(e.target.files[0]);
            }
        };
        fileInput.click();
    };

    // 获取当前语言的数据
    const currentI18nData = useMemo(() => {
        // 如果是 Source Tab，返回 playlist 原始数据
        if (activeLanguage === SOURCE_TAB) {
            return {
                playlistId: playlist.playlistId || '',
                language: SOURCE_TAB,
                title: playlist.title || '',
                description: playlist.description || '',
                tags: playlist.tags || '',
                seoTitle: playlist.seo?.title || '',
                seoDescription: playlist.seo?.description || '',
                seoKeywords: playlist.seo?.keywords || '',
            };
        }

        // 其他语言从 i18nData 获取
        return (
            i18nData.get(activeLanguage) || {
                playlistId: playlist.playlistId || '',
                language: activeLanguage,
                title: '',
                description: '',
                tags: '',
                seoTitle: '',
                seoDescription: '',
                seoKeywords: '',
            }
        );
    }, [i18nData, activeLanguage, playlist]);

    // 检查语言是否有内容
    const hasContent = useCallback(
        (language: string) => {
            const data = i18nData.get(language);
            if (!data) return false;
            return !!(data.title || data.description || data.tags || data.seoTitle || data.seoDescription || data.seoKeywords);
        },
        [i18nData]
    );

    // 检测源数据是否被修改
    useEffect(() => {
        if (hasI18nData && lastTranslatedSource) {
            const currentSource = JSON.stringify({
                title: playlist.title || '',
                description: playlist.description || '',
                tags: playlist.tags || '',
                seoTitle: playlist.seo?.title || '',
                seoDescription: playlist.seo?.description || '',
                seoKeywords: playlist.seo?.keywords || '',
            });
            setSourceModified(currentSource !== lastTranslatedSource);
        }
    }, [playlist.title, playlist.description, playlist.tags, playlist.seo, lastTranslatedSource, hasI18nData]);

    // 更新多语言字段
    const handleI18nFieldChange = useCallback(
        (field: keyof PlaylistArgs.I18nItem, value: string) => {
            // 如果是 Source Tab，更新 playlist 数据
            if (activeLanguage === SOURCE_TAB) {
                if (field === 'title' || field === 'description' || field === 'tags') {
                    setPlaylist(prev => ({ ...prev, [field]: value }));
                } else if (field === 'seoTitle') {
                    setPlaylist(prev => ({ ...prev, seo: { ...prev.seo, title: value } }));
                } else if (field === 'seoDescription') {
                    setPlaylist(prev => ({ ...prev, seo: { ...prev.seo, description: value } }));
                } else if (field === 'seoKeywords') {
                    setPlaylist(prev => ({ ...prev, seo: { ...prev.seo, keywords: value } }));
                }
                return;
            }

            // 其他语言更新 i18nData
            setI18nData(prev => {
                const newMap = new Map(prev);
                const current = newMap.get(activeLanguage) || {
                    playlistId: playlist.playlistId || '',
                    language: activeLanguage,
                    title: '',
                    description: '',
                    tags: '',
                    seoTitle: '',
                    seoDescription: '',
                    seoKeywords: '',
                };
                newMap.set(activeLanguage, { ...current, [field]: value });
                return newMap;
            });
        },
        [activeLanguage, playlist.playlistId]
    );

    const handleAITranslate = async () => {
        if (!playlist.playlistId) {
            toast.error('Please save the playlist first');
            return;
        }

        // 验证 title 必填
        if (!playlist.title || playlist.title.trim() === '') {
            toast.error('Title is required');
            return;
        }

        // 验证 description 必填（翻译需要）
        if (!playlist.description || playlist.description.trim() === '') {
            toast.error('Description is required for translation');
            return;
        }

        setIsTranslating(true);
        try {
            // 1. 先使用 onSave 回调保存最新的 playlist 数据
            const success = await onSave(
                {
                    ...playlist,
                    playlistId: playlist.playlistId,
                },
                userInfo?.website?.siteId,
                coverFile
            );

            if (!success) {
                toast.error('Failed to save playlist data');
                return;
            }

            // 2. 调用翻译接口
            const response = await PlaylistApi.createI18n(playlist.playlistId);

            if (response.code === 0 && response.data) {
                // 更新多语言数据（保留现有的手动编辑内容）
                const dataMap = new Map<string, PlaylistArgs.I18nItem>();
                response.data.forEach(item => {
                    dataMap.set(item.language, item);
                });
                setI18nData(dataMap);
                setHasI18nData(true);

                // 记录翻译时的源数据快照
                setLastTranslatedSource(
                    JSON.stringify({
                        title: playlist.title || '',
                        description: playlist.description || '',
                        tags: playlist.tags || '',
                        seoTitle: playlist.seo?.title || '',
                        seoDescription: playlist.seo?.description || '',
                        seoKeywords: playlist.seo?.keywords || '',
                    })
                );
                setSourceModified(false);

                toast.success('AI translation completed successfully!');
            } else {
                // 翻译失败，保留现有内容
                toast.error(response.info || 'Translation failed, please try again');
            }
        } catch (error) {
            console.error('AI translation error:', error);
            // 翻译失败，保留现有内容
            toast.error('Translation failed, please try again');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="fixed top-0 right-0 h-screen shadow-lg">
            <div className="w-[480px] bg-layout h-full flex flex-col">
                <div className="flex items-center justify-between px-6 h-16 border-b">
                    <div className="flex gap-4">
                        <h2 className="text-lg font-medium">{!isEdit ? 'Create playlist' : 'Playlist details'}</h2>
                        {isEdit && (!hasI18nData || activeLanguage === SOURCE_TAB) && (
                            <Button variant="light" size="xs" leftSection={<IconSparkles size={14} />} onClick={handleAITranslate} loading={isTranslating} disabled={isTranslating}>
                                AI Translate
                                {sourceModified && (
                                    <Tooltip label="Source content has been modified. Click to re-translate." position="bottom" withArrow>
                                        <div className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                                    </Tooltip>
                                )}
                            </Button>
                        )}
                    </div>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* SEO 区域 - 根据是否有多语言数据显示不同UI */}
                    {hasI18nData ? (
                        <div className="space-y-4">
                            {/* 多语言标签栏 */}
                            <Tabs value={activeLanguage} onChange={value => value && setActiveLanguage(value)}>
                                <ScrollArea type="auto" offsetScrollbars>
                                    <Tabs.List className="flex-shrink-0 flex-nowrap" style={{ flexWrap: 'nowrap' }}>
                                        {LANGUAGES.map(lang => (
                                            <Tabs.Tab key={lang.code} value={lang.code} className="relative whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{lang.label}</span>
                                                    {lang.isSource && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Source</span>}
                                                    {!lang.isSource && (
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${hasContent(lang.code) ? 'bg-green-500' : 'bg-gray-300'}`}
                                                            title={hasContent(lang.code) ? 'Has content' : 'Empty'}
                                                        />
                                                    )}
                                                </div>
                                            </Tabs.Tab>
                                        ))}
                                    </Tabs.List>
                                </ScrollArea>

                                {/* 多语言输入字段 */}
                                <div className="pt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Title<span className="text-red-500">*</span>
                                        </label>
                                        <TextInput
                                            value={currentI18nData.title}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter title...' : 'Click AI Translate to generate...'}
                                            onChange={e => handleI18nFieldChange('title', e.target.value)}
                                            variant="filled"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <Textarea
                                            value={currentI18nData.description}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter description...' : 'Click AI Translate to generate...'}
                                            minRows={3}
                                            onChange={e => handleI18nFieldChange('description', e.target.value)}
                                            variant="filled"
                                            resize="vertical"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tags</label>
                                        <TextInput
                                            value={currentI18nData.tags}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter tags, comma separated...' : 'Click AI Translate to generate...'}
                                            onChange={e => handleI18nFieldChange('tags', e.target.value)}
                                            variant="filled"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-medium">SEO</h3>
                                        <Tooltip withArrow label="Please complete the SEO details to help search engines index your content." position="top">
                                            <IconInfoCircle size={16} className="text-gray-500" />
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">SEO Title</label>
                                        <TextInput
                                            value={currentI18nData.seoTitle}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter SEO title...' : 'Click AI Translate to generate...'}
                                            onChange={e => handleI18nFieldChange('seoTitle', e.target.value)}
                                            variant="filled"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">SEO Description</label>
                                        <Textarea
                                            value={currentI18nData.seoDescription}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter SEO description...' : 'Click AI Translate to generate...'}
                                            minRows={2}
                                            onChange={e => handleI18nFieldChange('seoDescription', e.target.value)}
                                            variant="filled"
                                            resize="vertical"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">SEO Keywords</label>
                                        <TextInput
                                            value={currentI18nData.seoKeywords}
                                            placeholder={activeLanguage === SOURCE_TAB ? 'Enter keywords, comma separated...' : 'Click AI Translate to generate...'}
                                            onChange={e => handleI18nFieldChange('seoKeywords', e.target.value)}
                                            variant="filled"
                                        />
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <TextInput
                                        value={playlist?.title ?? ''}
                                        placeholder="Enter playlist title"
                                        onChange={e => handleInputChange('title', e.target.value)}
                                        variant="filled"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        value={playlist?.description ?? ''}
                                        placeholder="Add some description"
                                        minRows={4}
                                        onChange={e => handleInputChange('description', e.target.value)}
                                        variant="filled"
                                        resize="vertical"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags</label>
                                    <TextInput value={playlist?.tags ?? ''} placeholder="Add tags" onChange={e => handleInputChange('tags', e.target.value)} variant="filled" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-medium">SEO</h3>
                                    <Tooltip withArrow label="Please complete the SEO details to help search engines index your content." position="top">
                                        <IconInfoCircle size={16} className="text-gray-500" />
                                    </Tooltip>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <TextInput
                                        value={playlist?.seo?.title ?? ''}
                                        placeholder="SEO title"
                                        onChange={e => handleSeoChange('title', e.target.value)}
                                        variant="filled"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <Textarea
                                        value={playlist?.seo?.description ?? ''}
                                        placeholder="Add description"
                                        minRows={3}
                                        onChange={e => handleSeoChange('description', e.target.value)}
                                        variant="filled"
                                        resize="vertical"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Keywords</label>
                                    <TextInput
                                        value={playlist?.seo?.keywords ?? ''}
                                        placeholder="Add keywords, comma separated"
                                        onChange={e => handleSeoChange('keywords', e.target.value)}
                                        variant="filled"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* User Source - always visible regardless of i18n state */}
                    <div>
                        <label className="block text-sm font-medium mb-2">User Source</label>
                        <MultiSelect
                            data={[
                                { value: VideoUtmSource.all, label: 'All' },
                                { value: VideoUtmSource.none, label: 'Organic' },
                                { value: VideoUtmSource.facebook, label: 'Facebook' },
                                // { value: 'm2', label: 'Google' },
                                // { value: 'a1', label: 'Aitubo' },
                                // { value: 'v1', label: 'ViggleAI' },
                                // { value: 'f1', label: 'Fantasy' },
                            ]}
                            value={playlist?.utmSource ? playlist.utmSource.split(',') : ['']}
                            onChange={(value: string[]) => {
                                // '' (All default) and 'none' are exclusive options
                                const lastSelected = value.length > 0 ? value[value.length - 1] : undefined;

                                let result: string[];
                                if (value.length === 0 || lastSelected === '' || lastSelected === 'none') {
                                    // Exclusive: clear everything else; empty selection resets to All
                                    result = [lastSelected ?? ''];
                                } else {
                                    // Remove exclusive options if specific sources are selected
                                    const filteredValue = value.filter(v => v !== '' && v !== 'none');
                                    result = filteredValue.length ? filteredValue : [''];
                                }

                                // Save as comma-separated string
                                handleInputChange('utmSource', result.join(','));
                            }}
                            variant="filled"
                            clearable
                            searchable
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Cover</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 bg-[#F4F4F7] rounded-lg flex items-center justify-center overflow-hidden">
                                {coverFile ? (
                                    coverFile.type.startsWith('video/') || coverFile.name.toLowerCase().endsWith('.webm') ? (
                                        <video src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                    )
                                ) : playlist.cover ? (
                                    playlist.cover.toLowerCase().includes('.webm') ? (
                                        <video
                                            src={withResMediaCacheBust(playlist.cover, playlist.updatedAt) ?? playlist.cover}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={withResMediaCacheBust(playlist.cover, playlist.updatedAt) ?? playlist.cover}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                    )
                                ) : null}
                            </div>
                            <Button variant="filled" color="primary" size="md" onClick={handleUploadImage}>
                                Upload Image
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Select
                            value={playlist?.status?.toString() ?? '2'}
                            data={[
                                { value: PlaylistStatus.PUBLISHED.toString(), label: 'Published' },
                                { value: PlaylistStatus.UNPUBLISHED.toString(), label: 'Unpublished' },
                            ]}
                            onChange={value => handleInputChange('status', Number(value))}
                            variant="filled"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-white">
                    <Button loading={isLoading} fullWidth color="primary" onClick={handleSave}>
                        {!isEdit ? 'Create Playlist' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetailEdit;
