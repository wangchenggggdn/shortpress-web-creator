import React from 'react';
import { IconArrowLeft } from '@tabler/icons-react';
import { SectionType, DataSourceType } from '@/types/editor';
import ContentTypeSelector from '../common/ContentTypeSelector';

interface ContentTypeModalProps {
    open: boolean;
    onClose: () => void;
    sectionType: SectionType;
    onSelect: (type: DataSourceType) => void;
}

const ContentTypeModal: React.FC<ContentTypeModalProps> = ({ open, onClose, sectionType, onSelect }) => {
    if (!open) return null;

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
                    <h2 className="text-lg font-semibold">Add Content</h2>
                </div>
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-2">
                        <ContentTypeSelector
                            sectionType={sectionType}
                            onSelect={(type) => {
                                onSelect(type);
                                onClose();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentTypeModal; 