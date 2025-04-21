'use client';

import React, { useEffect, useState } from 'react';
import { Button, Radio, NumberInput } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import PlaylistApi from '@/api/playlist';

interface SetPriceProps {
    onClose: () => void;
    onSave: (data: { type: 'free' | 'paid'; price: number; freeNum: number }) => void;
    defaultValues?: {
        type: 'free' | 'paid';
        price: number;
        freeNum: number;
    };
    playlistId: string;
}

const SetPrice: React.FC<SetPriceProps> = ({ onClose, onSave, defaultValues = { type: 'free', price: 0, freeNum: 0 }, playlistId }) => {
    const [type, setType] = useState<'free' | 'paid'>(defaultValues.type);
    const [price, setPrice] = useState<number>(defaultValues.price);
    const [freeNum, setFreeNum] = useState<number>(defaultValues.freeNum);

    useEffect(() => {
        PlaylistApi.get(playlistId).then(res => {
            const playlist = res.data;
            setType(playlist.accessType === 1 ? 'free' : 'paid');
            setPrice(playlist.singleVideoPrice);
            setFreeNum(playlist.freeVideos);
        });
    }, [playlistId]);

    const handleSave = () => {
        onSave({
            type,
            price,
            freeNum,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 z-50" onClick={onClose}>
            <div className="shadow-lg " onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between pl-6 pr-2 h-16 bg-white">
                    <h2 className="text-lg font-medium">Set Price</h2>
                    <Button variant="subtle" color="gray" onClick={onClose} className="hover:bg-gray-100">
                        <IconX size={20} />
                    </Button>
                </div>

                <div className="flex flex-row h-[calc(100vh-4rem)]">
                    {/* Content Area */}
                    <div className="w-80 bg-layout flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-6 pt-0 pb-6 space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type</label>
                                    <div className="flex gap-8">
                                        <Radio.Group value={type} onChange={value => setType(value as 'free' | 'paid')}>
                                            <div className="flex gap-8">
                                                <Radio value="free" label="Free" />
                                                <Radio value="paid" label="Paid" />
                                            </div>
                                        </Radio.Group>
                                    </div>
                                </div>

                                {/* Price Settings (Only shown when type is paid) */}
                                {type === 'paid' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Coins per Episode</label>
                                            <NumberInput value={price} onChange={value => setPrice(Number(value))} min={0} placeholder="Enter coins amount" variant="filled" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Free Episodes</label>
                                            <NumberInput
                                                value={freeNum}
                                                onChange={value => setFreeNum(Number(value))}
                                                min={0}
                                                placeholder="Enter free episodes number"
                                                variant="filled"
                                            />
                                            <div className="mt-1 text-xs text-gray-500">First N episodes will be free to watch</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-white flex-shrink-0">
                            <Button fullWidth onClick={handleSave} color="primary">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetPrice;
