import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch, IconArrowLeft } from '@tabler/icons-react';

interface Playlist {
    id: string;
    name: string;
    videoCount: number;
    coverUrl?: string;
}

interface PlaylistSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (playlistId: string, playlistName: string) => void;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ open, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [playlists, setPlaylists] = useState<Playlist[]>([
        // Mock data, replace with real API call
        {
            id: '1',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        },
        {
            id: '2',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        },
        {
            id: '3',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        },
        {
            id: '4',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        },
        {
            id: '5',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        },
        {
            id: '6',
            name: "Mafia's tender torutre",
            videoCount: 30,
            coverUrl: 'https://placeholder.com/300x200'
        }
    ]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

    if (!open) return null;

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = () => {
        if (selectedPlaylist) {
            const playlist = playlists.find(p => p.id === selectedPlaylist);
            if (playlist) {
                onSelect(playlist.id, playlist.name);
                onClose();
            }
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
                                key={playlist.id}
                                className={`cursor-pointer rounded-lg overflow-hidden border ${
                                    selectedPlaylist === playlist.id ? 'border-primary' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedPlaylist(playlist.id)}
                            >
                                <div className="aspect-video bg-gray-100">
                                    {playlist.coverUrl && (
                                        <img
                                            src={playlist.coverUrl}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-2">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {playlist.name}
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