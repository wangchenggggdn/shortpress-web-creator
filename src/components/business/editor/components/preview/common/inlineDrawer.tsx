// src/components/InlinedDrawer.tsx (或者你喜欢的任何路径)

'use client';

import React from 'react';
import { ScrollArea, Title, CloseButton, Divider } from '@mantine/core';

interface InlinedDrawerProps {
    opened: boolean;
    onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title: string;
    children: React.ReactNode;
    size?: string; // 比如 '80%' 或者 '300px'
}

export const InlinedDrawer: React.FC<InlinedDrawerProps> = ({
    opened,
    onClose,
    title,
    children,
    size = '80%', // 默认宽度 80%
}) => {
    return (
        // 核心容器：
        // - 绝对定位，贴在父容器右侧
        // - flex布局，让header和body能垂直排列
        // - transition-transform 实现平滑动画
        // - 通过 `opened` 状态切换 `translateX` 来控制显示和隐藏
        <div
            className={`
                absolute top-0 right-0 h-full bg-black text-white
                flex flex-col shadow-lg 
                transform transition-transform duration-300 ease-in-out
                ${opened ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{ width: size, zIndex: 50 }} // 使用 style 来设置动态宽度和层级
        >
            {/* 1. 抽屉头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                <Title order={4} c="white">{title}</Title>
                <CloseButton title="Close drawer" onClick={onClose} c="white" />
            </div>

            {/* 2. 抽屉主体内容 (可滚动) */}
            {children}
        </div>
    );
};