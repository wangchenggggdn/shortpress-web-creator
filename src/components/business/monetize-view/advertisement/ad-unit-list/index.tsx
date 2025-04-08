'use client';

import React from 'react';
import { Table, Badge, Menu } from '@mantine/core';
import { IconDots, IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { AdUnit, AdFormat, AdStatus } from '@/types/ads';

interface AdUnitListProps {
    adUnits: AdUnit[];
    onEdit: (adUnit: AdUnit) => void;
    onStatusChange: (adUnit: AdUnit, status: AdStatus) => void;
}

const AdUnitList: React.FC<AdUnitListProps> = ({ adUnits, onEdit, onStatusChange }) => {
    const getFormatLabel = (format: number) => {
        switch (format) {
            case AdFormat.DISPLAY:
                return 'Display';
            case AdFormat.INTERSTITIAL:
                return 'Interstitial';
            case AdFormat.NATIVE:
                return 'Native';
            case AdFormat.REWARDED:
                return 'Rewarded';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case AdStatus.ACTIVE:
                return 'green';
            case AdStatus.PAUSED:
                return 'yellow';
            case AdStatus.ARCHIVED:
                return 'gray';
            default:
                return 'gray';
        }
    };

    return (
        <div className="h-full w-full">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="w-[200px] xl:w-[500px] text-black-purple/60">Name</Table.Th>
                        <Table.Th className="text-black-purple/60">Page</Table.Th>
                        <Table.Th className="text-black-purple/60">Ad Type</Table.Th>
                        <Table.Th className="text-black-purple/60">Ad Networks</Table.Th>
                        <Table.Th className="text-black-purple/60">Status</Table.Th>
                        <Table.Th className="text-black-purple/60">Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {adUnits.map((adUnit, index) => (
                        <Table.Tr key={adUnit.adId + 'adUnit' + index}>
                            <Table.Td className="text-black-purple/90">{adUnit.name}</Table.Td>
                            <Table.Td className="text-black-purple/70">{adUnit.page}</Table.Td>
                            <Table.Td className="text-black-purple/70">{getFormatLabel(adUnit.format)}</Table.Td>
                            <Table.Td className="text-black-purple/70">{adUnit.adNetwork}</Table.Td>
                            <Table.Td>
                                <Badge color={getStatusColor(adUnit.status)}>{AdStatus[adUnit.status]}</Badge>
                            </Table.Td>
                            <Table.Td>
                                <Menu position="bottom-end" withArrow>
                                    <Menu.Target>
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black-purple/5 text-black-purple/50 hover:text-black-purple">
                                            <IconDots size={16} />
                                        </button>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(adUnit)} className="text-black-purple/70">
                                            Edit
                                        </Menu.Item>
                                        {adUnit.status === AdStatus.ACTIVE && (
                                            <Menu.Item
                                                leftSection={<IconPlayerPause size={14} />}
                                                onClick={() => onStatusChange(adUnit, AdStatus.PAUSED)}
                                                color="yellow"
                                                className="text-black-purple"
                                            >
                                                Pause
                                            </Menu.Item>
                                        )}
                                        {adUnit.status === AdStatus.PAUSED && (
                                            <Menu.Item
                                                leftSection={<IconPlayerPlay size={14} />}
                                                onClick={() => onStatusChange(adUnit, AdStatus.ACTIVE)}
                                                color="green"
                                                className="text-black-purple"
                                            >
                                                Active
                                            </Menu.Item>
                                        )}
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <div className="w-full h-full flex items-center justify-center">No Ad Unit Yet</div>
        </div>
    );
};

export default AdUnitList;
