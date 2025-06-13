import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

interface UrlInputSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const UrlInputSelector: React.FC<UrlInputSelectorProps> = ({ open, onClose, onSelect }) => {
    const [urlInput, setUrlInput] = useState('');

    if (!open) return null;

    const handleSelect = () => {
        if (urlInput && urlInput !== '/') {
            onSelect(urlInput);
            setUrlInput('');
            onClose();
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
                    <h2 className="text-lg font-semibold">Add URL to Menu</h2>
                </div>
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-6">
                    <TextInput
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Input or Paste URL"
                        error={urlInput === '/' ? 'Root path is not allowed' : ''}
                        variant="filled"
                    />
                </div>
                {/* 底部按钮 */}
                <div className="p-6 border-t">
                    <button
                        className={`w-full py-2 rounded transition-colors ${
                            urlInput && urlInput !== '/'
                                ? 'bg-primary text-white hover:bg-primary-hover'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                        onClick={handleSelect}
                        disabled={!urlInput || urlInput === '/'}
                    >
                        Add to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrlInputSelector; 