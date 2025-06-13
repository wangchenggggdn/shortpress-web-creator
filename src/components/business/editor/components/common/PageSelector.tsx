import React, { useState } from 'react';
import { Select } from '@mantine/core';
import { Page } from '@/types/editor';
import { IconArrowLeft } from '@tabler/icons-react';

interface PageSelectorProps {
    open: boolean;
    onClose: () => void;
    pages: Page[];
    onSelect: (pageId: string, pageName: string) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ open, onClose, pages, onSelect }) => {
    const [selectedPage, setSelectedPage] = useState<string | null>(null);

    if (!open) return null;

    const handleSelect = () => {
        if (selectedPage) {
            const page = pages.find(p => p.id === selectedPage);
            if (page) {
                onSelect(page.id, page.name);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* 遮罩 */}
            <div className="flex-1 bg-black/30" onClick={onClose}></div>
            {/* 侧边栏内容 */}
            <div className="w-[400px] h-full bg-white shadow-xl flex flex-col">
                {/* 顶部 */}
                <div className="flex items-center gap-2 px-4 py-4 border-b">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <IconArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Add Page to Menu</h2>
                </div>
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Select
                        data={pages.map(page => ({
                            value: page.id,
                            label: page.name,
                        }))}
                        value={selectedPage}
                        onChange={setSelectedPage}
                        placeholder="Select Page"
                        variant="filled"
                    />
                </div>
                {/* 底部按钮 */}
                <div className="p-6 border-t">
                    <button
                        className={`w-full py-2 rounded transition-colors ${selectedPage ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-gray-100 text-gray-400'}`}
                        onClick={handleSelect}
                        disabled={!selectedPage}
                    >
                        Add to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageSelector;
