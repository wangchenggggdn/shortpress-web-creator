'use client';

import React from 'react';
import { Button } from '@mantine/core';

interface GuideItemProps {
    /** Title text */
    title: string;
    /** Description text */
    description: string;
    /** Button text */
    buttonText: string;
    /** Button click event handler */
    onClick: () => void;
    /** Button width class name */
    buttonClassName?: string;
}

/**
 * Guide Card Item Component
 * Displays a single guide step with title, description and action button
 */
const GuideItem: React.FC<GuideItemProps> = ({ title, description, buttonText, onClick, buttonClassName = 'w-full md:w-auto my-2' }) => {
    return (
        <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white`}>✓</div>
            <div className="flex-1 flex flex-col gap-2 bg-white rounded-2xl p-4">
                <div className="font-semibold text-lg">{title}</div>
                <div className="text-gray-500">{description}</div>
                <Button w={300} variant="filled" color="primary" onClick={onClick} className={buttonClassName}>
                    {buttonText}
                </Button>
            </div>
        </div>
    );
};

export default GuideItem;
