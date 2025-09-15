'use client';
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import DefaultImage from '../defult-image';

// 创建一个简单的内存缓存
const imageCache = new Map<string, string>();

interface CacheLazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    defaultImage?: string;
}

const CacheLazyImage: React.FC<CacheLazyImageProps> = ({
    src,
    alt,
    className = '',
    defaultImage,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true, // 只触发一次
        threshold: 0.1, // 当图片有10%进入视口时触发
    });

    useEffect(() => {
        if (!inView) return;

        const loadImage = async () => {
            // 检查缓存中是否已有该图片
            if (imageCache.has(src)) {
                setImageSrc(imageCache.get(src)!);
                setIsLoading(false);
                return;
            }

            try {
                // 创建一个新的图片对象来预加载
                const img = new Image();
                img.src = src;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                // 加载成功后，将图片URL存入缓存
                imageCache.set(src, src);
                setImageSrc(src);
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading image:', err);
                setError(true);
                setIsLoading(false);
            }
        };

        loadImage();
    }, [inView, src]);

    return (
        <div ref={ref} className={className}>
            {isLoading ? (
               <></>
            ) : error ? (
                <></>
            ) : (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={className}
                    {...props}
                />
            )}
        </div>
    );
};

export default CacheLazyImage; 