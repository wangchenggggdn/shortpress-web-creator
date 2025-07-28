import React, { useState, useEffect } from 'react';
import { Page } from '@/types/editor';
import { IconArrowLeft } from '@tabler/icons-react';
import { TextInput, Textarea } from '@mantine/core';
import { toast } from 'sonner';
import useEditorStore from '@/store/useEditorStore';

interface PageSettingsModalProps {
    open: boolean;
    onClose: () => void;
    page: Page;
    onUpdate: (page: Page) => void;
}

const PageSettingsModal: React.FC<PageSettingsModalProps> = ({ open, onClose, page, onUpdate }) => {
    const seo = page.metadata && typeof page.metadata === 'object' && 'seo' in page.metadata && page.metadata.seo ? page.metadata.seo : {};
    const [name, setName] = useState(page.name);
    const [path, setPath] = useState(page.path);
    const [title, setTitle] = useState(seo.title || '');
    const [description, setDescription] = useState(seo.description || '');
    const [keywords, setKeywords] = useState(Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords || '');
    const { currentVersion } = useEditorStore();

    useEffect(() => {
        const seo = page.metadata && typeof page.metadata === 'object' && 'seo' in page.metadata && page.metadata.seo ? page.metadata.seo : {};
        setName(page.name);
        setPath(page.path);
        setTitle(seo.title || '');
        setDescription(seo.description || '');
        setKeywords(Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords || '');
    }, [page]);

    if (!open) return null;

    const handleUpdate = () => {
        const pathRegex = /^\/[a-zA-Z0-9-_]+$/;
        if (!pathRegex.test(path)) {
            toast.error('Invalid path format. Path should start with / and contain only letters, numbers, hyphens and underscores');
            return;
        }

       const isExist = currentVersion?.pages.find(p => p.path === path);
       if(isExist&&isExist.id!==page.id){
        toast.error('Path already exists');
        return;
       }
        
        onUpdate({
            ...page,
            name,
            path,
            metadata: {
                ...page.metadata,
                seo: { title, description, keywords: keywords },
            },
        });
        onClose();
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
                    <button className="w-full bg-primary text-white py-2 rounded" onClick={handleUpdate}>
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageSettingsModal;
