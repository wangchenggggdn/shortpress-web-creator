'use client';

import { WebsiteArgs } from '@/api/args';
import TemplateApi from '@/api/template';
import WebsiteApi from '@/api/website';
import LogoUploader from '@/components/common/logo-uploader';
import userStore from '@/store/useUserStore';
import { Template } from '@/types/template';
import { TranslationFieldType } from '@/types/translation';
import { Website } from '@/types/website';
import { TranslationHelper } from '@/utils/translationHelper';
import { Box, Button, Group, Select, SelectProps, Textarea, TextInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/** Settings → General: accent palette for visitor site (value 0–7 stored in DB). */
const WEBSITE_THEME_SELECT_DATA: { value: string; label: string; color: string }[] = [
    { value: '0', label: 'Green (emerald)', color: '#10b981' },
    { value: '1', label: 'Sky blue (sky)', color: '#0ea5e9' },
    { value: '2', label: 'Violet', color: '#8b5cf6' },
    { value: '3', label: 'Orange', color: '#f97316' },
    { value: '4', label: 'Pink', color: '#ec4899' },
    { value: '5', label: 'Cyan', color: '#06b6d4' },
    { value: '6', label: 'Slate gray', color: '#6b7280' },
    { value: '7', label: 'Red', color: '#ef4444' },
];

const renderWebsiteThemeOption: SelectProps['renderOption'] = ({ option }) => {
    const row = WEBSITE_THEME_SELECT_DATA.find(o => o.value === option.value);
    const color = row?.color ?? '#888888';
    return (
        <Group flex="1" gap="sm" wrap="nowrap">
            <Box w={14} h={14} style={{ borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
            <span className="text-sm" style={{ flex: 1, minWidth: 0 }}>
                {row?.label ?? option.label}
            </span>
            <span className="text-xs text-gray-500 font-mono flex-shrink-0">{color}</span>
        </Group>
    );
};

/**
 * Props interface for CreateSiteModal component
 */
interface CreateSiteModalProps {
    /** Whether the modal is open */
    opened?: boolean;
    /** Callback function when modal is closed */
    onClose?: () => void;
    /** Whether the modal is in edit mode */
    isEdit?: boolean;
    /** Website data for editing */
    websiteOld?: Website;
    /** Loading state for submit button */
    loading?: boolean;
    /** Callback function when form is submitted */
    onSubmit: (siteData: WebsiteArgs.Modify, coverFile?: File) => void;
    type?: 'setting' | 'modal';
}

/**
 * Modal component for creating or editing a website
 * Provides form fields for website details and SEO settings
 * @returns React component with website creation/editing interface
 */
const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
    opened = false,
    onClose,
    isEdit = false,
    onSubmit,
    websiteOld = { status: 2 } as Website,
    loading = false,
    type = 'modal',
}) => {
    const { userInfo } = userStore();
    const [website, setWebsite] = React.useState<Website>(JSON.parse(JSON.stringify(websiteOld)));
    const [pathError, setPathError] = React.useState<string>('');
    const [templateList, setTemplateList] = useState<Template[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);
    let coverFile: File | undefined;

    const checkPath = async (name: string) => {
        if (!name) return;

        const path = websiteOld.siteId === null || websiteOld.siteId === undefined ? name : website.path;
        try {
            const res = await WebsiteApi.checkPathExists(path ?? '');
            if (res.code !== 0) {
                setPathError(res.info ?? '');
            } else {
                setPathError('');
            }
        } catch (error) {
            setPathError('Failed to validate path');
        }
    };

    // 创建防抖函数，延迟500ms
    const debouncedCheck = useCallback(
        debounce((name: string) => checkPath(name), 500),
        []
    );

    const handleSubmit = async (websiteData: Partial<Website>) => {
        if (!websiteData.name) {
            toast.error('Please enter a site name');
            return;
        }

        if (websiteOld.siteId === null || websiteOld.siteId === undefined) {
            websiteData.path = websiteData.name;
        }

        websiteData.path = disposeSiteName(websiteData.name ?? '');

        // 翻译网站名称和 SEO
        setIsTranslating(true);
        try {
            const translationItems = [];

            // 翻译网站名称
            if (websiteData.name && websiteData.name.trim()) {
                translationItems.push({
                    fieldType: TranslationFieldType.WEBSITE,
                    texts: {
                        name: websiteData.name.trim(),
                    },
                    context: {
                        websiteId: website?.siteId,
                    },
                });
            }

            // 翻译 SEO（仅在编辑模式）
            if (isEdit && websiteData.seo) {
                const seoTexts: any = {};
                if (websiteData.seo.title && websiteData.seo.title.trim()) {
                    seoTexts.title = websiteData.seo.title.trim();
                }
                if (websiteData.seo.description && websiteData.seo.description.trim()) {
                    seoTexts.description = websiteData.seo.description.trim();
                }
                if (websiteData.seo.keywords && websiteData.seo.keywords.trim()) {
                    seoTexts.keywords = websiteData.seo.keywords.trim();
                }

                if (Object.keys(seoTexts).length > 0) {
                    translationItems.push({
                        fieldType: TranslationFieldType.WEBSITE_SEO,
                        texts: seoTexts,
                        context: {
                            websiteId: website?.siteId,
                        },
                    });
                }

                // ✅ 清空对应的多语言字段（如果 SEO 字段为空）
                if (websiteData.seoMultiLang) {
                    const seoMultiLang = { ...websiteData.seoMultiLang };

                    // 如果 title 为空，删除 title 的多语言数据
                    if (!websiteData.seo.title || !websiteData.seo.title.trim()) {
                        delete seoMultiLang.title;
                    }

                    // 如果 description 为空，删除 description 的多语言数据
                    if (!websiteData.seo.description || !websiteData.seo.description.trim()) {
                        delete seoMultiLang.description;
                    }

                    // 如果 keywords 为空，删除 keywords 的多语言数据
                    if (!websiteData.seo.keywords || !websiteData.seo.keywords.trim()) {
                        delete seoMultiLang.keywords;
                    }

                    // 如果所有字段都被删除了，清空整个 seoMultiLang
                    if (Object.keys(seoMultiLang).length === 0) {
                        delete websiteData.seoMultiLang;
                    } else {
                        websiteData.seoMultiLang = seoMultiLang;
                    }
                }
            }

            // ✅ 清空网站名称的多语言字段（如果名称为空）
            if (!websiteData.name || !websiteData.name.trim()) {
                if (websiteData.siteMultiLang) {
                    delete websiteData.siteMultiLang;
                }
            }

            // 如果有需要翻译的内容，执行翻译
            if (translationItems.length > 0) {
                const translationRequest = {
                    items: translationItems,
                };

                const response = await WebsiteApi.translate(website?.siteId || 'temp', translationRequest);

                if (response.code === 0 && response.data && response.data.length > 0) {
                    // 应用翻译结果
                    for (const result of response.data) {
                        if (result.fieldType === TranslationFieldType.WEBSITE && result.translations) {
                            // 应用网站名称翻译
                            const nameTranslations: any = {};
                            for (const trans of result.translations) {
                                if (trans.name) {
                                    nameTranslations[trans.lang] = trans.name;
                                }
                            }

                            if (Object.keys(nameTranslations).length > 0) {
                                websiteData.siteMultiLang = {
                                    name: {
                                        original: websiteData.name || '',
                                        translations: nameTranslations,
                                    },
                                };
                            }
                        } else if (result.fieldType === TranslationFieldType.WEBSITE_SEO && result.translations) {
                            // 应用 SEO 翻译
                            const seoMultiLang: any = {};

                            for (const trans of result.translations) {
                                if (trans.title) {
                                    if (!seoMultiLang.title) {
                                        seoMultiLang.title = {
                                            original: websiteData.seo?.title || '',
                                            translations: {},
                                        };
                                    }
                                    seoMultiLang.title.translations[trans.lang] = trans.title;
                                }

                                if (trans.description) {
                                    if (!seoMultiLang.description) {
                                        seoMultiLang.description = {
                                            original: websiteData.seo?.description || '',
                                            translations: {},
                                        };
                                    }
                                    seoMultiLang.description.translations[trans.lang] = trans.description;
                                }

                                if (trans.keywords) {
                                    if (!seoMultiLang.keywords) {
                                        seoMultiLang.keywords = {
                                            original: websiteData.seo?.keywords || '',
                                            translations: {},
                                        };
                                    }
                                    seoMultiLang.keywords.translations[trans.lang] = trans.keywords;
                                }
                            }

                            if (Object.keys(seoMultiLang).length > 0) {
                                websiteData.seoMultiLang = seoMultiLang;
                            }
                        }
                    }

                    toast.success('Translation completed');
                }
            }
        } catch (error) {
            console.error('Translation error:', error);
            toast.warning('Translation failed, saving without translation');
        } finally {
            setIsTranslating(false);
        }

        onSubmit(
            {
                siteId: website?.siteId ?? '',
                path: websiteData.path,
                ...websiteData,
            },
            coverFile
        );
    };

    // get template list
    const getTemplateList = async () => {
        try {
            const res = await TemplateApi.getTemplateLists({
                page: 1,
                pageSize: 10,
            });
            if (res.code === 0 && res.data) {
                setTemplateList(res.data.items);
            }
        } catch (error) {
            toast.error('Failed to get template list, please try again');
        }
    };

    useEffect(() => {
        getTemplateList();
    }, []);

    useEffect(() => {
        // If no template is selected, select the first template
        if (!website.templateId) {
            setWebsite({ ...website, templateId: templateList[0]?.templateId ?? '' });
        }
    }, [templateList]);

    const disposeSiteName = (siteName: string) => {
        if (!siteName) return '';
        const newSiteName = siteName
            .replace(/[`~!@#$%^&*()_\-+=<>?:"{}|｜,.\/;'\\[\]·~!！@#￥%……&*（）——\-+={}|《》〈〉？："""【】「」、；''，。、]/g, '')
            .replace(/\s/g, '-')
            .toLowerCase();
        return newSiteName;
    };

    const isValidIPv4 = (str: string) => {
        // 使用正则表达式来验证 IPv4 格式
        const ipv4Regex = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        return ipv4Regex.test(str);
    };

    const getSiteDomain = () => {
        const siteName = website?.name ?? '';
        const defaultDomain = userInfo?.defultSiteDomain ?? '';
        if (isValidIPv4(defaultDomain)) {
            return `${defaultDomain}/${disposeSiteName(siteName)}`;
        } else {
            return `${disposeSiteName(siteName)}.${defaultDomain}`;
        }
    };

    /**
     * Handle logo file selection
     * @param file Selected logo file
     */
    const onFileSelect = (file: File) => {
        coverFile = file;
    };

    if (!opened) return null;

    return (
        <div className="overflow-y-scroll">
            {/* Header */}
            {type === 'modal' && (
                <div className="flex items-center justify-between px-6 h-16">
                    <h2 className="text-2xl font-medium">{isEdit ? 'Edit Site' : 'Create Site'}</h2>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 px-6 space-y-6 ">
                {/* Site Name Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Site name</h3>
                    <TextInput
                        onChange={e => {
                            const newName = e.target.value;
                            setWebsite({ ...website, name: newName });
                            if (!isEdit) {
                                debouncedCheck(newName);
                            }
                        }}
                        defaultValue={website?.name ?? ''}
                        placeholder="Site name"
                        variant="filled"
                    />
                </div>

                {/* Domain Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Site URL</h3>
                    <div className="h-11 bg-[#F4F4F7] rounded flex items-center px-4">
                        <span className="text-gray-400">{`${getSiteDomain()}`}</span>
                    </div>
                    {pathError && <p className="text-red-500">{pathError}</p>}
                </div>

                {/* Logo Upload Section */}
                <LogoUploader logo={website?.logo} onFileSelect={onFileSelect} />

                {type !== 'setting' && (
                    <>
                        <h3 className="text-lg font-medium mb-4">Templates</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {templateList.map(template => (
                                <div
                                    key={template.templateId}
                                    onClick={() => setWebsite({ ...website, templateId: template.templateId })}
                                    className={`cursor-pointer text-sm border p-2 rounded-lg text-center ${website.templateId === template.templateId ? 'border-[#131F60]' : 'border-gray-300'}`}
                                >
                                    {template.name}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Status Section */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Status</h3>
                    <Select
                        defaultValue={(website?.status ?? 0) === 2 ? 'published' : 'unpublished'}
                        onChange={value => {
                            website.status = value === 'published' ? 2 : 1;
                        }}
                        data={[
                            { value: 'published', label: 'Published' },
                            { value: 'unpublished', label: 'Unpulished' },
                        ]}
                        variant="filled"
                    />
                </div>

                {/* Theme (website settings → General only) */}
                {type === 'setting' && isEdit && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Theme</h3>
                        <Select
                            value={String(website.theme ?? 0)}
                            onChange={value => {
                                if (value !== null) {
                                    setWebsite({ ...website, theme: parseInt(value, 10) });
                                }
                            }}
                            data={WEBSITE_THEME_SELECT_DATA}
                            renderOption={renderWebsiteThemeOption}
                            leftSection={
                                <Box
                                    w={14}
                                    h={14}
                                    style={{
                                        borderRadius: 4,
                                        backgroundColor:
                                            WEBSITE_THEME_SELECT_DATA.find(o => o.value === String(website.theme ?? 0))?.color ?? '#888888',
                                    }}
                                />
                            }
                            leftSectionWidth={36}
                            variant="filled"
                        />
                    </div>
                )}

                {/* SEO Section (Edit Mode Only) */}
                {isEdit && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">SEO</h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Title"
                                defaultValue={website?.seo?.title ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: e.target.value,
                                        description: website.seo?.description ?? '',
                                        keywords: website.seo?.keywords ?? '',
                                    };
                                }}
                                placeholder="Add title"
                                variant="filled"
                            />
                            <Textarea
                                label="Description"
                                defaultValue={website?.seo?.description ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: website.seo?.title ?? '',
                                        description: e.target.value,
                                        keywords: website.seo?.keywords ?? '',
                                    };
                                }}
                                placeholder="Add description"
                                minRows={3}
                                variant="filled"
                            />
                            <TextInput
                                label="Keywords"
                                defaultValue={website?.seo?.keywords ?? ''}
                                onChange={e => {
                                    website.seo = {
                                        title: website.seo?.title ?? '',
                                        description: website.seo?.description ?? '',
                                        keywords: e.target.value,
                                    };
                                }}
                                placeholder="Add keywords"
                                variant="filled"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6">
                <Button loading={loading || isTranslating} fullWidth size="md" color="primary" onClick={() => handleSubmit(website)} disabled={!!pathError || isTranslating}>
                    {isTranslating ? 'Translating...' : isEdit ? 'Save Changes' : 'Create Site'}
                </Button>
            </div>
        </div>
    );
};

export default CreateSiteModal;
