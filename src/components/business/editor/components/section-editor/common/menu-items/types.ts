import { MenuItem } from '@/types/editor';

export interface BaseMenuItemProps {
    title: string;
    menuItem?: MenuItem;
    onToggle: () => void;
}

export interface LogoMenuItemProps extends BaseMenuItemProps {
    icon?: React.ReactNode;
    onUpload: (file: File) => void;
}

export interface LabelMenuItemProps extends BaseMenuItemProps {
    onChange: (value: string) => void;
    onBlur?: () => void;
    value?: string;
}

export interface IconMenuItemProps extends BaseMenuItemProps { } 