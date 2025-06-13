import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { Playlist } from '@/types/playlist';

interface PlaylistSelectorProps {
    open: boolean;
    isMultiSelect?: boolean;
    onClose: () => void;
    onSelect: (playlists: Playlist[]) => void;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ open, isMultiSelect = false, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([
        // Mock data, replace with real API call
        {
            playlistId: '1',
            title: "Mafia's tender torutre1",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        },
        {
            playlistId: '2',
            title: "Mafia's tender torutre2",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        },
        {
            playlistId: '3',
            title: "Mafia's tender torutre3",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        },
        {
            playlistId: '4',
            title: "Mafia's tender torutre4",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        },
        {
            playlistId: '5',
            title: "Mafia's tender torutre5",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        },
        {
            playlistId: '6',
            title: "Mafia's tender torutre6",
            videoCount: 30,
            cover: 'https://placeholder.com/300x200',
            createdAt: 1718236800,
            updatedAt: 1718236800,
            accessType: 1,
            singleVideoPrice: 0,
            freeVideos: 0
        }
    ]);


    if (!open) return null;

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = () => {
        if (selectedPlaylist) {
            onSelect(selectedPlaylist);
            onClose();
        }
  
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* 遮罩 */}
            <div className="flex-1 bg-black/30" onClick={onClose}></div>
            {/* 侧边栏内容 */}
            <div className="w-[400px] h-full bg-white shadow-xl flex flex-col">
                {/* 顶部 */}
                <div className="flex items-center gap-2 px-4 py-4 border-b">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                        <IconArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">Add Playlist to Menu</h2>
                </div>
                {/* 内容 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <TextInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search playlist"
                        leftSection={<IconSearch size={16} />}
                        variant="filled"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {filteredPlaylists.map((playlist) => (
                            <div
                                key={playlist.playlistId}
                                className={`cursor-pointer rounded-lg overflow-hidden border ${
                                    selectedPlaylist.includes(playlist) ? 'border-primary' : 'border-gray-200'
                                }`}
                                onClick={() => {
                                    if (isMultiSelect) {
                                        if (selectedPlaylist.includes(playlist)) {
                                            setSelectedPlaylist(selectedPlaylist.filter(p => p.playlistId !== playlist.playlistId));
                                        } else {
                                            setSelectedPlaylist([...(selectedPlaylist || []), playlist]);
                                        }
                                    } else {
                                        if (selectedPlaylist.includes(playlist)) {
                                            setSelectedPlaylist(selectedPlaylist.filter(p => p.playlistId !== playlist.playlistId));
                                        } else {
                                            setSelectedPlaylist([playlist]);
                                        }
                                    }
                                }}
                            >
                                <div className="aspect-video bg-gray-100">
                                    {playlist.cover && (
                                        <img    
                                            src={playlist.cover}
                                            alt={playlist.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-2">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {playlist.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {playlist.videoCount} videos
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* 底部按钮 */}
                <div className="p-6 border-t">
                    <button
                        className={`w-full py-2 rounded transition-colors ${
                            selectedPlaylist
                                ? 'bg-primary text-white hover:bg-primary-hover'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                        onClick={handleSelect}
                        disabled={!selectedPlaylist}
                    >
                        Add to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistSelector; 