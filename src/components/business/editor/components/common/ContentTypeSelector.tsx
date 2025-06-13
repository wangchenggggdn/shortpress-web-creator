import React from 'react';
import { Menu } from '@mantine/core';
import { SectionType, DataSourceType } from '@/types/editor';
import { IconPlaylist, IconClock, IconStarFilled } from '@tabler/icons-react';

interface ContentTypeSelectorProps {
    sectionType: SectionType;
    onSelect: (type: DataSourceType) => void;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ sectionType, onSelect }) => {
    const contentTypes = [
        {
            type: DataSourceType.PLAYLIST,
            icon: IconPlaylist,
            label: 'Playlist',
            description: 'Add existing playlists to section',
        },
        {
            type: DataSourceType.CONTINUE_WATCHING,
            icon: IconClock,
            label: 'Continue Watching',
            description: 'Display the most recently watched for the user',
        },
        {
            type: DataSourceType.NEW_RELEASE,
            icon: IconStarFilled,
            label: 'New Release',
            description: 'Display the most recently released playlists',
        },
    ];

    // Scroll section doesn't have Continue Watching option
    const filteredTypes = sectionType === SectionType.SCROLL ? contentTypes.filter(type => type.type !== DataSourceType.CONTINUE_WATCHING) : contentTypes;

    return (
        <Menu.Dropdown>
            {filteredTypes.map(({ type, icon: Icon, label, description }) => (
                <Menu.Item key={type} leftSection={<Icon size={16} />} onClick={() => onSelect(type)}>
                    <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                    </div>
                </Menu.Item>
            ))}
        </Menu.Dropdown>
    );
};

export default ContentTypeSelector;
