import React, { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

interface InputModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (value: string) => boolean | Promise<boolean>; // ✅ 支持异步
    title: string;
    placeholder?: string;
    submitText?: string;
    initialValue?: string;
}

const InputModal: React.FC<InputModalProps> = ({ opened, onClose, onSubmit, title, placeholder = 'Enter value', submitText = 'Submit', initialValue = '' }) => {
    const [value, setValue] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 添加提交状态

    useEffect(() => {
        if (!opened) {
            setValue('');
        }
    }, [opened]);

    const handleSubmit = async () => {
        // ✅ 改为异步
        if (!value.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await onSubmit(value.trim()); // ✅ 等待结果
            if (success) {
                setValue('');
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!opened) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-lg w-[320px] p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-medium text-[#1C1C1E]">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                        <IconX size={18} />
                    </button>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-10 px-3 mb-4 border border-[#E5E7EB] rounded-lg 
                             focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]
                             placeholder:text-[#9CA3AF]"
                    autoFocus
                />

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || isSubmitting}
                    className="w-full h-10 rounded-lg text-white font-medium
                             bg-[#6366F1] hover:bg-[#4F46E5] 
                             disabled:bg-[#E5E7EB] disabled:text-gray-400
                             transition-colors duration-200"
                >
                    {isSubmitting ? 'Submitting...' : submitText}
                </button>
            </div>
        </div>
    );
};

export default InputModal;
