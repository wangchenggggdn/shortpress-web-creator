'use client';

import React from 'react';
import { Button, ButtonProps } from '@mantine/core';

interface UploadButtonProps extends Omit<ButtonProps, 'children'> {
    text?: string;
    onClick?: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ text = 'Upload Videos', onClick, ...props }) => {
    return (
        <Button variant="filled" color="primary" onClick={onClick} {...props}>
            + {text}
        </Button>
    );
};

export default UploadButton;
