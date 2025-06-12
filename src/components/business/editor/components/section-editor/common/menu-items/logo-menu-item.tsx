import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { LogoMenuItemProps } from './types';

const LogoMenuItem: React.FC<LogoMenuItemProps> = ({
    title,
    menuItem,
    icon = <IconPlus size={32} />,
    onToggle,
    onUpload,
}) => {
    return (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[15px] font-medium text-black-purple">{title}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={menuItem?.visible ?? true}
                        onChange={onToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
            <div className="space-y-3">
                <div className="w-full aspect-[2/1] bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2">
                    {menuItem?.image ? (
                        <img
                            src={menuItem.image}
                            alt="Logo"
                            className="w-full h-full object-contain p-4"
                        />
                    ) : (
                        <>
                            {icon}
                            <span className="text-sm text-gray-500">Add your logo</span>
                        </>
                    )}
                </div>
                <button 
                    className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) onUpload(file);
                        };
                        input.click();
                    }}
                >
                    Upload
                </button>
            </div>
        </div>
    );
};

export default LogoMenuItem; 