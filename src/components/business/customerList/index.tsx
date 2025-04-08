'use client';

import React, { useEffect, useState } from 'react';
import { Table, Menu, Badge, Pagination } from '@mantine/core';
import { IconDots, IconEye, IconPlayerPlay, IconPlayerPause, IconTrash } from '@tabler/icons-react';
import { Customer, CustomerStatus } from '@/types/customer';
import CustomerApi from '@/api/customer';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import userStore from '@/store/useUserStore';
import Header from '@/components/system/header';
import Search from '@/components/common/search';
import LoadingData from '@/components/common/loadingData';
import { useRouter } from '@/libs/navigation';
import { usePathname } from 'next/navigation';

interface CustomerListProps {}

const CustomerList: React.FC<CustomerListProps> = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const { userInfo } = userStore();
    const pathName = usePathname();

    const getItemsPerPage = () => {
        return 20;
    };

    useEffect(() => {
        if (userInfo?.website?.siteId) {
            loadCustomers();
        }
    }, [userInfo, searchKeyword, activePage]);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await CustomerApi.list({
                query: searchKeyword,
                page: activePage,
                pageSize: getItemsPerPage(),
                siteId: userInfo?.website?.siteId ?? '',
            });
            setCustomers(response.data.items);
            setTotal(response.data.total);
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
            loadCustomers();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (customer: Customer) => {
        try {
            await CustomerApi.changeStatus({
                email: customer.email,
                siteId: userInfo?.website?.siteId ?? '',
                status: CustomerStatus.DELETED,
            });
            toast.success('Customer deleted successfully');
            loadCustomers();
        } catch (error) {
            console.error('Failed to delete customer:', error);
            toast.error('Failed to delete customer');
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
            case CustomerStatus.DELETED:
                return 'Deleted';
            default:
                return 'Unknown';
        }
    };

    const handleViewDetail = (customer: Customer) => {
        if (customer.status === 127) {
            // Deleted status
            toast.error('This customer has been deleted');
            return;
        }
        // First encode to base64
        const encodedEmail = btoa(customer.email);
        // Then make it URL safe
        const urlSafeEmail = encodeURIComponent(encodedEmail);
        router.push(`${pathName}/${urlSafeEmail}`);
    };

    return (
        <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 min-h-0 flex flex-col">
                {/* Search Header */}
                <div className="flex justify-center items-center py-4">
                    <Search className="w-96" value={searchKeyword} onChange={setSearchKeyword} placeholder="Search customers" />
                </div>

                {/* Table Container */}
                <div className="px-6 pb-6 h-full">
                    <div className="h-full p-4 flex flex-col bg-layout rounded-lg">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <LoadingData />
                            </div>
                        ) : customers.length > 0 ? (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <Table>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th className="text-black-purple/60">Email</Table.Th>
                                                <Table.Th className="text-black-purple/60">Since</Table.Th>
                                                <Table.Th className="text-black-purple/60">Last login</Table.Th>
                                                <Table.Th className="text-black-purple/60">Status</Table.Th>
                                                <Table.Th className="text-black-purple/60">Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {customers.map(customer => (
                                                <Table.Tr
                                                    key={customer.email}
                                                    className={`${customer.status !== 127 ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50'}`}
                                                    onClick={() => customer.status !== 127 && handleViewDetail(customer)}
                                                >
                                                    <Table.Td className="text-black-purple/90">{customer.email}</Table.Td>
                                                    <Table.Td className="text-black-purple/70">{dayjs(customer.createdAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                                    <Table.Td className="text-black-purple/70">{dayjs(customer.lastLoginAt * 1000).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                                    <Table.Td>
                                                        <Badge color={getStatusColor(customer.status)}>{getStatusLabel(customer.status)}</Badge>
                                                    </Table.Td>
                                                    <Table.Td onClick={e => e.stopPropagation()}>
                                                        <Menu position="bottom-end" withArrow>
                                                            <Menu.Target>
                                                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black-purple/5 text-black-purple/50 hover:text-black-purple">
                                                                    <IconDots size={16} />
                                                                </button>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                {customer.status !== CustomerStatus.DELETED && (
                                                                    <Menu.Item
                                                                        leftSection={<IconEye size={14} />}
                                                                        className="text-black-purple/70"
                                                                        onClick={() => handleViewDetail(customer)}
                                                                    >
                                                                        View Detail
                                                                    </Menu.Item>
                                                                )}
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
                                                                {customer.status !== CustomerStatus.DELETED && (
                                                                    <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(customer)}>
                                                                        Delete
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
                                {/* Pagination */}
                                <div className="pt-4 flex-shrink-0">
                                    <Pagination
                                        value={activePage}
                                        onChange={setActivePage}
                                        total={Math.ceil(total / getItemsPerPage())}
                                        color="primary"
                                        radius="xl"
                                        className="flex justify-center"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-black-purple text-lg mb-2">No customers found</p>
                                    <p className="text-gray-500 text-sm">Try adjusting your search</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
