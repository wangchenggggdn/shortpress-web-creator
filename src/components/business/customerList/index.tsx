'use client';

import React, { useState } from 'react';
import { Table, TextInput, Menu, Badge } from '@mantine/core';
import { IconSearch, IconDots, IconEye, IconPlayerPlay, IconPlayerPause, IconTrash } from '@tabler/icons-react';
import { Customer, CustomerStatus } from '@/types/customer';
import { IPaginationResponse } from '@/types/public';
import CustomerApi from '@/api/customer';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import userStore from '@/store/useUserStore';

interface CustomerListProps {
    initialData: IPaginationResponse<Customer>;
}

const CustomerList: React.FC<CustomerListProps> = ({ initialData }) => {
    const [customers, setCustomers] = useState<Customer[]>(initialData.items);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const { userInfo } = userStore();

    const loadCustomers = async (searchParams: { keyword?: string; page: number }) => {
        try {
            setLoading(true);
            const response = await CustomerApi.list({
                keyword: searchParams.keyword,
                page: searchParams.page,
                pageSize: 20,
                siteId: userInfo?.website?.siteId ?? '',
            });
            setCustomers(response.data.items);
        } catch (error) {
            console.error('Failed to load customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (customer: Customer, newStatus: CustomerStatus) => {
        try {
            await CustomerApi.changeStatus({
                email: customer.email,
                siteId: userInfo?.website?.siteId ?? '',
                status: newStatus,
            });
            toast.success('Status updated successfully');
            loadCustomers({ keyword: searchKeyword, page });
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: CustomerStatus) => {
        switch (status) {
            case CustomerStatus.ACTIVE:
                return 'green';
            case CustomerStatus.BLOCKED:
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: CustomerStatus) => {
        switch (status) {
            case CustomerStatus.ACTIVE:
                return 'Active';
            case CustomerStatus.BLOCKED:
                return 'Blocked';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="h-full p-4 flex flex-col bg-layout">
            <div className="bg-white rounded-lg flex-1 flex flex-col">
                {/* Search Header */}
                <div className="p-4 border-b">
                    <TextInput
                        placeholder="Search customer"
                        leftSection={<IconSearch size={16} />}
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                loadCustomers({ keyword: searchKeyword, page: 1 });
                            }
                        }}
                    />
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th className="text-black-purple/60">ID</Table.Th>
                                <Table.Th className="text-black-purple/60">Email</Table.Th>
                                <Table.Th className="text-black-purple/60">Since</Table.Th>
                                <Table.Th className="text-black-purple/60">Last login</Table.Th>
                                <Table.Th className="text-black-purple/60">Status</Table.Th>
                                <Table.Th className="text-black-purple/60">Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {customers.map(customer => (
                                <Table.Tr key={customer.email}>
                                    <Table.Td className="text-black-purple/90">{customer.email}</Table.Td>
                                    <Table.Td className="text-black-purple/70">{customer.nickname || '-'}</Table.Td>
                                    <Table.Td className="text-black-purple/70">{dayjs(customer.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                    <Table.Td className="text-black-purple/70">{dayjs(customer.lastLoginAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                    <Table.Td>
                                        <Badge color={getStatusColor(customer.status)}>{getStatusLabel(customer.status)}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Menu position="bottom-end" withArrow>
                                            <Menu.Target>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black-purple/5 text-black-purple/50 hover:text-black-purple">
                                                    <IconDots size={16} />
                                                </button>
                                            </Menu.Target>

                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconEye size={14} />} className="text-black-purple/70">
                                                    View Detail
                                                </Menu.Item>
                                                {customer.status === CustomerStatus.ACTIVE ? (
                                                    <Menu.Item
                                                        leftSection={<IconPlayerPause size={14} />}
                                                        onClick={() => handleStatusChange(customer, CustomerStatus.BLOCKED)}
                                                        color="red"
                                                    >
                                                        Block
                                                    </Menu.Item>
                                                ) : (
                                                    <Menu.Item
                                                        leftSection={<IconPlayerPlay size={14} />}
                                                        onClick={() => handleStatusChange(customer, CustomerStatus.ACTIVE)}
                                                        color="green"
                                                    >
                                                        Activate
                                                    </Menu.Item>
                                                )}
                                                <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                                                    Delete
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
