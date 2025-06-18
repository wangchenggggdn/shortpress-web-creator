'use client';

import React from 'react';
import { ScrollArea, Title, CloseButton, Divider } from '@mantine/core';

interface InlinedDrawerProps {
    opened: boolean;
    onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title: string;
    children: React.ReactNode;
    size?: string;
}

export const InlinedDrawer: React.FC<InlinedDrawerProps> = ({
    opened,
    onClose,
    title,
    children,
    size = '80%',
}) => {
    return (
        <div
            className={`
                z-30
                absolute top-0 right-0 h-[calc(100vh-68px)] bg-black text-white
                flex flex-col shadow-lg 
                transform transition-transform duration-300 ease-in-out
                ${opened ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ width: size, zIndex: 50 }} 
        >
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 ">
                    <Title order={4} c="white">{title}</Title>
                    <CloseButton disabled={true} title="Close drawer" onClick={onClose} c="white" />
                </div>
                {children}
        </div>
    );
};