import { Widget } from '@/types/editor';

export interface BaseMenuItemProps {
    title: string;
    widget?: any;
    onToggle: () => void;
}

export interface LogoMenuItemProps extends BaseMenuItemProps {
    isLoading?: boolean;
    icon?: React.ReactNode;
    onUpload: (file: File) => void;
}

export interface LabelMenuItemProps extends BaseMenuItemProps {
    onBlur?: (value: string) => void;
}

export interface IconMenuItemProps extends BaseMenuItemProps { } 