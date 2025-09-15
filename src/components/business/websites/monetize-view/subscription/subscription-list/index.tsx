import React from 'react';
import { Table, Badge, Menu } from '@mantine/core';
import { IconDots, IconPencil, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { SubscriptionData, SubscriptionStatus } from '@/types/subscription';

interface SubscriptionListProps {
    subscriptions: SubscriptionData[];
    onEdit: (sub: SubscriptionData) => void;
    onStatusChange: (sub: SubscriptionData, status: SubscriptionStatus) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, onEdit, onStatusChange }) => {
    const getStatusColor = (status: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.Active:
                return 'green';
            case SubscriptionStatus.Paused:
                return 'yellow';
            case SubscriptionStatus.Deleted:
                return 'gray';
            default:
                return 'gray';
        }
    };

    return (
        <div className="h-full w-full">
            <div className="overflow-auto">
                <Table stickyHeader>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Billing period</Table.Th>
                            <Table.Th>Price</Table.Th>
                            <Table.Th>Discount price</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {subscriptions.map((sub, index) => (
                            <Table.Tr key={sub.packageId + 'sub' + index}>
                                <Table.Td>{sub.name}</Table.Td>
                                <Table.Td>{sub.interval}</Table.Td>
                                <Table.Td>${sub.originalPrice}</Table.Td>
                                <Table.Td>${sub.price}</Table.Td>
                                <Table.Td>
                                    <Badge color={getStatusColor(sub.status)}>{sub.status === 1 ? 'Active' : 'Paused'}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Menu position="bottom-end" withArrow>
                                        <Menu.Target>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black-purple/5 text-black-purple/50 hover:text-black-purple">
                                                <IconDots size={16} />
                                            </button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(sub)} className="text-black-purple/70">
                                                Edit
                                            </Menu.Item>
                                            {sub.status === SubscriptionStatus.Active && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPause size={14} />}
                                                    onClick={() => onStatusChange(sub, SubscriptionStatus.Paused)}
                                                    color="yellow"
                                                    className="text-black-purple"
                                                >
                                                    Pause
                                                </Menu.Item>
                                            )}
                                            {sub.status === SubscriptionStatus.Paused && (
                                                <Menu.Item
                                                    leftSection={<IconPlayerPlay size={14} />}
                                                    onClick={() => onStatusChange(sub, SubscriptionStatus.Active)}
                                                    color="green"
                                                    className="text-black-purple"
                                                >
                                                    Resume
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
            {subscriptions.length === 0 && <div className="w-full h-full flex items-center justify-center">No Subscriptions Yet</div>}
        </div>
    );
};

export default SubscriptionList; 