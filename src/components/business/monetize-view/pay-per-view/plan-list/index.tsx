'use client';

import React from 'react';
import { Table, Badge, Menu } from '@mantine/core';
import { IconDots, IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';

interface Plan {
    planId: string;
    name: string;
    coins: number;
    price: number;
    tips: string;
    status: PlanStatus;
}

enum PlanStatus {
    ACTIVE = 0,
    PAUSED = 1,
    ARCHIVED = 2,
}

interface PlanListProps {
    plans: Plan[];
    onEdit: (plan: Plan) => void;
    onStatusChange: (plan: Plan, status: PlanStatus) => void;
}

const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onStatusChange }) => {
    const getStatusColor = (status: PlanStatus) => {
        switch (status) {
            case PlanStatus.ACTIVE:
                return 'green';
            case PlanStatus.PAUSED:
                return 'yellow';
            case PlanStatus.ARCHIVED:
                return 'gray';
            default:
                return 'gray';
        }
    };

    return (
        <div className="h-full w-full">
            <div className="overflow-scroll">
                <Table>
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
                            <Table.Tr key={plan.planId + 'plan' + index}>
                                <Table.Td className="text-black-purple/90">{plan.name}</Table.Td>
                                <Table.Td className="text-black-purple/70">{plan.coins}</Table.Td>
                                <Table.Td className="text-black-purple/70">${plan.price}</Table.Td>
                                <Table.Td className="text-black-purple/70">{plan.tips}</Table.Td>
                                <Table.Td>
                                    <Badge color={getStatusColor(plan.status)}>{PlanStatus[plan.status]}</Badge>
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
                                            {plan.status === PlanStatus.ACTIVE && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPause size={14} />}
                                                    onClick={() => onStatusChange(plan, PlanStatus.PAUSED)}
                                                    color="yellow"
                                                    className="text-black-purple"
                                                >
                                                    Pause
                                                </Menu.Item>
                                            )}
                                            {plan.status === PlanStatus.PAUSED && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPlay size={14} />}
                                                    onClick={() => onStatusChange(plan, PlanStatus.ACTIVE)}
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
            </div>
            {plans.length === 0 && <div className="w-full h-full flex items-center justify-center">No Plans Yet</div>}
        </div>
    );
};

export default PlanList;
