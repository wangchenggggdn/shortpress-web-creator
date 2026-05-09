'use client';

import { WebsiteArgs } from '@/api/args';
import CreatorApi from '@/api/creator';
import WebsiteApi from '@/api/website';
import LogoUploader from '@/components/common/logo-uploader';
import { useRouter } from '@/libs/navigation';
import userStore from '@/store/useUserStore';
import { Template } from '@/types/template';
import { TranslationFieldType } from '@/types/translation';
import { Button, TextInput } from '@mantine/core';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreateSitePageProps {
    templateList: Template[];
}

const CreateSiteClient: React.FC<CreateSitePageProps> = ({ templateList }) => {
    const { userInfo } = userStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [siteData, setSiteData] = useState<WebsiteArgs.Modify>({
        name: '',
        path: userInfo?.creatorName ?? '',
        status: 2,
        templateId: '',
    });
    let coverFile: File | undefined;
    const [pathError, setPathError] = useState('');

    const checkPath = async (path: string) => {
        if (!path) return;
        try {
            const res = await WebsiteApi.checkPathExists(path);
            if (res.code !== 0) {
                setPathError(res.info ?? '');
            } else {
                setPathError('');
            }
        } catch (error) {
            setPathError('Failed to validate path');
        }
    };

    const debouncedCheck = useCallback(
        debounce((path: string) => checkPath(path), 500),
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!siteData.name) {
            toast.error('Please enter a site name');
            return;
        }

        if (pathError) {
            return;
        }

        setLoading(true);
        setIsTranslating(true);

        try {
            // 上传 logo
            if (coverFile) {
                const formData = new FormData();
                formData.append('file', coverFile);
                const uploadRes = await CreatorApi.uploadFile(formData);
                if (uploadRes.code === 0) {
                    siteData.logo = uploadRes.data;
                }
            }

            siteData.path = disposeSiteName(siteData.name ?? '');

            // 翻译网站名称
            try {
                const translationItems = [];

                // 翻译网站名称
                if (siteData.name && siteData.name.trim()) {
                    translationItems.push({
                        fieldType: TranslationFieldType.WEBSITE,
                        texts: {
                            name: siteData.name.trim(),
                        },
                        context: {
                            websiteId: 'temp',
                        },
                    });
                }

                // 如果有需要翻译的内容，执行翻译
                if (translationItems.length > 0) {
                    const translationRequest = {
                        items: translationItems,
                    };

                    const response = await WebsiteApi.translate('temp', translationRequest);

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
                                    siteData.siteMultiLang = {
                                        name: {
                                            original: siteData.name || '',
                                            translations: nameTranslations,
                                        },
                                    };
                                }
                            }
                        }

                        toast.success('Translation completed');
                    }
                }
            } catch (error) {
                console.error('Translation error:', error);
                toast.warning('Translation failed, creating without translation');
            } finally {
                setIsTranslating(false);
            }

            // 创建网站
            const res = await WebsiteApi.create(siteData);
            if (res.code === 0) {
                toast.success('Site created successfully');
                router.push('/');
            } else {
                setPathError(res.info);
            }
        } catch (error) {
            console.error('Creation error:', error);
            toast.error('Creation failed, please try again');
        } finally {
            setLoading(false);
            setIsTranslating(false);
        }
    };

    const onFileSelect = (file: File) => {
        coverFile = file;
    };

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
        const siteName = siteData?.name ?? '';
        const defaultDomain = userInfo?.defultSiteDomain ?? '';
        if (isValidIPv4(defaultDomain)) {
            return `${defaultDomain}/${disposeSiteName(siteName)}`;
        } else {
            return `${disposeSiteName(siteName)}.${defaultDomain}`;
        }
    };

    useEffect(() => {
        // If no template is selected, select the first template
        if (!siteData.templateId) {
            setSiteData(pre => ({ ...pre, templateId: templateList[0]?.templateId ?? '' }));
        }
    }, [templateList]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-lg">
                    <div className="text-center text-3xl font-bold mb-6">Create Your Own Site</div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Site Name</h3>
                            <TextInput
                                value={siteData.name}
                                onChange={e => {
                                    const newName = e.target.value;
                                    if (newName.length > 40 || newName.length < 6) {
                                        setPathError('Site name must be between 6 and 40 characters');
                                    } else {
                                        setPathError('');
                                        const newPath = disposeSiteName(e.target.value);
                                        if (newPath) {
                                            debouncedCheck(newPath);
                                        }
                                    }
                                    setSiteData({ ...siteData, name: newName });
                                }}
                                placeholder="Enter site name"
                                variant="filled"
                                required
                                error={pathError}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-4">Domain</h3>
                            <div className="h-11 bg-[#F4F4F7] rounded flex items-center px-4">
                                <span className="text-gray-400">{`${getSiteDomain()}`}</span>
                            </div>
                        </div>

                        <LogoUploader onFileSelect={onFileSelect} />

                        <h3 className="text-lg font-medium mb-4">Templates</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {templateList.map(template => (
                                <div
                                    key={template.templateId}
                                    onClick={() => setSiteData(pre => ({ ...pre, templateId: template.templateId }))}
                                    className={`cursor-pointer text-sm border p-2 rounded-lg text-center ${siteData.templateId === template.templateId ? 'border-[#131F60]' : 'border-gray-300'}`}
                                >
                                    {template.name}
                                </div>
                            ))}
                        </div>

                        <Button type="submit" fullWidth color="primary" loading={loading || isTranslating} disabled={!!pathError || isTranslating}>
                            {isTranslating ? 'Translating...' : 'Create Site'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSiteClient;
