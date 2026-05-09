import React, { useState, useEffect } from 'react';
import { Page } from '@/types/editor';
import { IconArrowLeft } from '@tabler/icons-react';
import { TextInput, Textarea } from '@mantine/core';
import { toast } from 'sonner';
import useEditorStore from '@/store/useEditorStore';
import WebsiteApi from '@/api/website';
import { TranslationFieldType } from '@/types/translation';
import { TranslationHelper } from '@/utils/translationHelper';

interface PageSettingsModalProps {
    open: boolean;
    onClose: () => void;
    page: Page;
    onUpdate: (page: Page) => void;
    siteId: string; // ✅ 新增 siteId
}

const PageSettingsModal: React.FC<PageSettingsModalProps> = ({ open, onClose, page, onUpdate, siteId }) => {
    const seo = page.metadata && typeof page.metadata === 'object' && 'seo' in page.metadata && page.metadata.seo ? page.metadata.seo : {};
    const [name, setName] = useState(page.name);
    // 初始化时解码路径，保留开头的 /
    const [path, setPath] = useState(() => {
        try {
            return page.path.startsWith('/') ? '/' + decodeURIComponent(page.path.substring(1)) : page.path;
        } catch (e) {
            return page.path;
        }
    });
    const [title, setTitle] = useState(seo.title || '');
    const [description, setDescription] = useState(seo.description || '');
    const [keywords, setKeywords] = useState(Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords || '');
    const [isTranslating, setIsTranslating] = useState(false);
    const { currentVersion, setCurrentVersion } = useEditorStore();

    useEffect(() => {
        const seo = page.metadata && typeof page.metadata === 'object' && 'seo' in page.metadata && page.metadata.seo ? page.metadata.seo : {};
        setName(page.name);
        // 安全地解码路径，保留开头的 /
        try {
            const decodedPath = page.path.startsWith('/') ? '/' + decodeURIComponent(page.path.substring(1)) : page.path;
            setPath(decodedPath);
        } catch (e) {
            // 如果解码失败，使用原始路径
            setPath(page.path);
        }
        setTitle(seo.title || '');
        setDescription(seo.description || '');
        setKeywords(Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords || '');
    }, [page]);

    if (!open) return null;

    const handleUpdate = async () => {
        // 验证路径不能为空
        if (!path || path.trim() === '') {
            toast.error('Path cannot be empty');
            return;
        }

        // 验证路径必须以 / 开头
        if (!path.startsWith('/')) {
            toast.error('Path must start with /');
            return;
        }

        // 移除开头的 /
        const pathWithoutSlash = path.substring(1);

        if (!pathWithoutSlash) {
            toast.error('Path cannot be empty');
            return;
        }

        // URL 编码路径用于验证和存储
        const encodedPath = '/' + encodeURIComponent(pathWithoutSlash);

        // 检查路径是否已存在
        const isExist = currentVersion?.pages.find(p => p.path === encodedPath);
        if (isExist && isExist.id !== page.id) {
            toast.error('Path already exists');
            return;
        }

        setIsTranslating(true);

        try {
            if (!currentVersion) return;

            // 深拷贝当前版本
            const updatedVersion = JSON.parse(JSON.stringify(currentVersion));

            // 查找页面
            const pageIndex = updatedVersion.pages.findIndex((p: Page) => p.id === page.id);
            if (pageIndex === -1) {
                toast.error('Page not found');
                return;
            }

            // 更新页面数据（使用编码后的路径）
            const updatedPage: Page = {
                ...updatedVersion.pages[pageIndex],
                name,
                path: encodedPath, // ✅ 使用编码后的路径
                metadata: {
                    ...updatedVersion.pages[pageIndex].metadata,
                    seo: {
                        title: title.trim(),
                        description: description.trim(),
                        keywords: keywords.trim(),
                    },
                },
            };

            // ✅ 清空对应的多语言字段（如果 SEO 字段为空）
            if (!updatedPage.metadata) {
                updatedPage.metadata = {};
            }

            // 如果有 seoMultiLang，需要清空对应的空字段
            if (updatedPage.metadata.seoMultiLang) {
                const seoMultiLang = { ...updatedPage.metadata.seoMultiLang };

                // 如果 title 为空，删除 title 的多语言数据
                if (!title.trim()) {
                    delete seoMultiLang.title;
                }

                // 如果 description 为空，删除 description 的多语言数据
                if (!description.trim()) {
                    delete seoMultiLang.description;
                }

                // 如果 keywords 为空，删除 keywords 的多语言数据
                if (!keywords.trim()) {
                    delete seoMultiLang.keywords;
                }

                // 如果所有字段都被删除了，清空整个 seoMultiLang
                if (Object.keys(seoMultiLang).length === 0) {
                    delete updatedPage.metadata.seoMultiLang;
                } else {
                    updatedPage.metadata.seoMultiLang = seoMultiLang;
                }
            }

            // 同样处理 nameMultiLang
            if (!name.trim() && updatedPage.nameMultiLang) {
                delete updatedPage.nameMultiLang;
            }

            // ✅ 先保存到 pages 数组中
            updatedVersion.pages[pageIndex] = updatedPage;

            // 尝试翻译（只翻译非空字段）
            try {
                // 收集非空的文本字段
                const texts: any = {};
                if (name.trim()) texts.name = name.trim();
                if (title.trim()) texts.title = title.trim();
                if (description.trim()) texts.description = description.trim();
                if (keywords.trim()) texts.keywords = keywords.trim();

                // 只有在有非空字段时才翻译
                if (Object.keys(texts).length > 0) {
                    toast.info('Translating page content...');

                    const translationRequest = {
                        items: [
                            {
                                fieldType: TranslationFieldType.PAGE,
                                texts,
                                context: {
                                    versionId: updatedVersion.id,
                                    pageId: page.id,
                                },
                            },
                        ],
                    };

                    const response = await WebsiteApi.translate(siteId, translationRequest);

                    // 检查翻译是否成功
                    if (response.code === 0 && response.data && response.data.length > 0) {
                        // 创建临时网站对象用于应用翻译
                        const tempWebsite = {
                            id: '',
                            name: '',
                            versions: [updatedVersion],
                            currentVersion: updatedVersion.id,
                        };

                        // 应用翻译结果
                        const translatedWebsite = TranslationHelper.applyTranslationResults(tempWebsite, response.data);

                        // 从翻译后的网站中获取更新后的版本
                        const translatedVersion = translatedWebsite.versions[0];
                        const translatedPage = translatedVersion.pages.find((p: Page) => p.id === page.id);

                        if (translatedPage) {
                            // ✅ 更新翻译结果
                            updatedVersion.pages[pageIndex] = translatedPage;
                        }

                        toast.success('Page content translated successfully');
                    } else if (response.code === 7001) {
                        console.warn('Translation service not configured');
                        toast.warning('Translation service not configured, saving without translation');
                    } else if (response.code === 7002) {
                        console.warn('Translation service failed');
                        toast.warning('Translation failed, saving without translation');
                    } else {
                        console.warn('Translation failed');
                        toast.warning('Translation failed, saving without translation');
                    }
                } else {
                    // 所有字段都是空的，跳过翻译
                    console.log('All fields are empty, skipping translation');
                }
            } catch (translationError) {
                console.error('Translation error:', translationError);
                toast.warning('Translation failed, saving without translation');
            }

            // 更新版本
            setCurrentVersion(updatedVersion);

            // 调用 onUpdate 回调
            onUpdate(updatedVersion.pages[pageIndex]);

            toast.success('Page updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to update page:', error);
            toast.error('Failed to update page');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* 遮罩 */}
            <div className="flex-1 bg-black/30" onClick={onClose}></div>
            {/* 侧边栏内容 */}
            <div className="w-[480px] h-full bg-white shadow-xl flex flex-col">
                {/* 顶部 */}
                <div className="flex items-center gap-2 px-4 py-4 border-b">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <IconArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Page Settings</h2>
                </div>
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium mb-2">Page's name (on your menu)</h3>
                        <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Page name" variant="filled" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-2">URL</h3>
                        <TextInput disabled={page.path === '/for-you'} value={path} onChange={e => setPath(e.target.value)} placeholder="/your-path" variant="filled" />
                        <p className="text-xs text-gray-500 mt-1">Path must start with / and supports Chinese characters</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-2">SEO</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-medium mb-1">Title</div>
                                <TextInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Page Title in search results" variant="filled" />
                            </div>
                            <div>
                                <div className="text-xs font-medium mb-1">Description</div>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Page Description in search results"
                                    minRows={3}
                                    variant="filled"
                                />
                            </div>
                            <div>
                                <div className="text-xs font-medium mb-1">Keywords</div>
                                <TextInput value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Add keywords (comma separated)" variant="filled" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* 底部按钮 */}
                <div className="p-6 border-t">
                    <button
                        className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleUpdate}
                        disabled={isTranslating}
                    >
                        {isTranslating ? 'Translating & Saving...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageSettingsModal;
