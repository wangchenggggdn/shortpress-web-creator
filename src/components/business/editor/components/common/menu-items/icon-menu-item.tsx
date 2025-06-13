import React from 'react';
import { IconMenuItemProps } from './types';

const IconMenuItem: React.FC<IconMenuItemProps> = ({
    title,
    widget,
    onToggle,
}) => {
    return (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-black-purple">{title}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={widget?.visible ?? true}
                        onChange={onToggle}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
        </div>
    );
};

export default IconMenuItem; 