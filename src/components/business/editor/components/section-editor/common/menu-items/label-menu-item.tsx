import React, { useState } from 'react';
import { LabelMenuItemProps } from './types';

const LabelMenuItem: React.FC<LabelMenuItemProps> = ({
    title,
    widget,
    onToggle,
    onBlur,
}) => {
    const [localValue, setLocalValue] = useState(widget?.data || '');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    }

    return (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
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
            <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                value={localValue}
                onChange={handleChange}
                onBlur={() => onBlur?.(localValue)}
                placeholder="Enter label text"
            />
        </div>
    );
};

export default LabelMenuItem; 