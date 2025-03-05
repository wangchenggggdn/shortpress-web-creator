'use client';
import React from 'react';
import { Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconExclamationCircle } from '@tabler/icons-react';

/**
 * Props interface for CustomPopover component
 */
interface IProps {
    /** Custom target element to trigger the popover */
    target?: React.ReactNode;
    /** Content to display in the popover dropdown */
    dropdown: React.ReactNode;
    /** Position of the popover relative to the target */
    position?: 'top' | 'top-start' | 'top-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end';
}

/**
 * Custom popover component with hover functionality
 * Displays a popover when hovering over the target element
 * @returns React component with popover interface
 */
const CustomPopover: React.FC<IProps> = ({ target, dropdown, position = 'bottom' }) => {
    const [opened, { close, open }] = useDisclosure(false);

    return (
        <Popover position={position} withArrow shadow="md" opened={opened}>
            <Popover.Target>{target ? target : <IconExclamationCircle className="w-4 h-4" onMouseEnter={open} onMouseLeave={close} />}</Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: 'none' }}>{dropdown}</Popover.Dropdown>
        </Popover>
    );
};

export default CustomPopover;
