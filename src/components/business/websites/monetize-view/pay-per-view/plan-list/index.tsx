'use client';

import React from 'react';
import { Table, Badge, Menu } from '@mantine/core';
import { IconDots, IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { CoinPackage, PackageStatus } from '@/types/payment';

interface PlanListProps {
    plans: CoinPackage[];
    onEdit: (plan: CoinPackage) => void;
    onStatusChange: (plan: CoinPackage, status: PackageStatus) => void;
}

const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onStatusChange }) => {
    const getStatusColor = (status: PackageStatus) => {
        switch (status) {
            case PackageStatus.Enabled:
                return 'green';
            case PackageStatus.Disabled:
                return 'yellow';
            case PackageStatus.Deleted:
                return 'gray';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: PackageStatus) => {
        switch (status) {
            case PackageStatus.Enabled:
                return 'Enabled';
            case PackageStatus.Disabled:
                return 'Disabled';
            case PackageStatus.Deleted:
                return 'Deleted';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <Table stickyHeader>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th className="w-[200px] xl:w-[500px] text-black-purple/60">Plan</Table.Th>
                            <Table.Th className="text-black-purple/60">Coins</Table.Th>
                            <Table.Th className="text-black-purple/60">Price</Table.Th>
                            <Table.Th className="text-black-purple/60">Tips</Table.Th>
                            <Table.Th className="text-black-purple/60">Status</Table.Th>
                            <Table.Th className="text-black-purple/60">Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {plans.map((plan, index) => (
                            <Table.Tr key={plan.packageId + 'plan' + index}>
                                <Table.Td className="text-black-purple/90">{plan.name}</Table.Td>
                                <Table.Td className="text-black-purple/70">{plan.coinAmount}</Table.Td>
                                <Table.Td className="text-black-purple/70">${plan.price}</Table.Td>
                                <Table.Td className="text-black-purple/70">{plan.discountPercentage}%</Table.Td>
                                <Table.Td>
                                    <Badge color={getStatusColor(plan.status)}>{getStatusLabel(plan.status)}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Menu position="bottom-end" withArrow>
                                        <Menu.Target>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black-purple/5 text-black-purple/50 hover:text-black-purple">
                                                <IconDots size={16} />
                                            </button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(plan)} className="text-black-purple/70">
                                                Edit
                                            </Menu.Item>
                                            {plan.status === PackageStatus.Enabled && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPause size={14} />}
                                                    onClick={() => onStatusChange(plan, PackageStatus.Disabled)}
                                                    color="yellow"
                                                    className="text-black-purple"
                                                >
                                                    Disable
                                                </Menu.Item>
                                            )}
                                            {plan.status === PackageStatus.Disabled && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPlay size={14} />}
                                                    onClick={() => onStatusChange(plan, PackageStatus.Enabled)}
                                                    color="green"
                                                    className="text-black-purple"
                                                >
                                                    Enable
                                                </Menu.Item>
                                            )}
                                        </Menu.Dropdown>
                                    </Menu>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </div>
            {plans.length === 0 && <div className="w-full h-full flex items-center justify-center">No Plans Yet</div>}
        </div>
    );
};

export default PlanList;
