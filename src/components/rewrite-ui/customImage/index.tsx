'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackgroundImage, Image } from '@mantine/core';

import loading_logo from '@/assets/images/loading_logo.webp';

/**
 * Props interface for CustomImage component
 */
interface IProps {
    /** Image source URL */
    src: string;
    /** Alt text for the image */
    alt: string;
    /** Width of the image placeholder */
    width?: number;
    /** Height of the image placeholder */
    height?: number;
    /** Whether to show background after loading */
    completeShowBackground?: boolean;
    /** Whether to enable lazy loading */
    isLazy?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Border radius of the image */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Custom image component with lazy loading and placeholder support
 * Provides image loading with background placeholder and lazy loading functionality
 * @returns React component with image interface
 */
const CustomImage: React.FC<IProps> = ({ src, alt, width = 1, height = 1, completeShowBackground = true, isLazy = true, className = '', radius = 'md' }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgIsShow, setImgIsShow] = useState<boolean>(false); // Whether the image is visible
    const transparentImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const url = useMemo(() => {
        if (isLazy) {
            return imgIsShow ? src : transparentImg;
        } else {
            return src;
        }
    }, [src, imgIsShow]);
    useEffect(() => {
        if (isLazy) {
            const observe = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setImgIsShow(true);
                            imgRef.current && observe.unobserve(imgRef.current);
                        }
                    });
                },
                { threshold: 0 }
            );

            imgRef.current && observe.observe(imgRef.current);

            return () => {
                observe && observe.disconnect();
            };
        }
    }, []);

    return (
        <BackgroundImage
            src={completeShowBackground || url === transparentImg ? loading_logo.src : ''}
            radius={radius}
            style={{
                aspectRatio: `${width} / ${height}`,
            }}
            className={`w-full h-full ${completeShowBackground || url === transparentImg ? 'bg-[#346aff]/15' : 'bg-transparent'} bg-center !bg-[length:auto_36%] bg-no-repeat overflow-hidden`}
        >
            <Image ref={imgRef} src={url} alt={alt} radius={radius} height={height} width={width} className={`w-full h-full object-cover object-top ${className}`} />
        </BackgroundImage>
    );
};

export default CustomImage;
